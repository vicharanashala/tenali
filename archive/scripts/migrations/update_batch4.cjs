const fs = require('fs');
const path = require('path');

const batch4 = {
  algebra: {
    title: "Algebra: The Language of the Unknown",
    blocks: [
      { 
        icon: "???", 
        title: "1. The Core Concept: The Mathematical Detective", 
        content: "Imagine finding a locked treasure chest with a sticky note that says 'Gold Coins + 5 = 12'. Even without opening the chest, you instantly know there are 7 coins inside! **Algebra** is simply the art of finding unknown numbers. Instead of writing 'Gold Coins', mathematicians use letters like 'x' or 'y' as placeholders for the mystery number. It's not a scary new language; it's just a way to solve puzzles without guessing." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Golden Rule of Balance", 
        content: "An algebraic equation is exactly like a perfectly balanced set of scales. If you have 'x + 5 = 12', the two sides weigh exactly the same. The golden rule is: **Whatever you do to one side, you MUST do to the exact same thing to the other side.** If you add 10 to the left, you must add 10 to the right. If you chop the left side in half, you must chop the right side in half. If you break this rule, the scales tip over and the equation is destroyed!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Isolating the Variable", 
        content: "Your mission is always to get the letter 'x' completely alone on one side of the equals sign. We do this using **Inverse Operations** (doing the opposite):\n\n1. **Identify the 'enemy':** Look at what is attached to the 'x' (e.g., in 3x + 4, the enemies are the '×3' and the '+4').\n2. **Attack the weakest link first:** Always get rid of loose addition or subtraction before dealing with multiplication or division. (Get rid of the +4 first).\n3. **Do the opposite:** To get rid of a +4, you must subtract 4. (Do it to BOTH sides!).\n4. **Finish it:** To get rid of '×3', you must divide by 3. (Do it to BOTH sides!)." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Cracking the Code", 
        content: "Solve for x: **2x - 7 = 11**\n\n• **Step 1 (The loose end):** The weakest link is the '- 7'. The opposite of subtracting 7 is adding 7.\n• **Step 2 (Balance):** Add 7 to BOTH sides. (2x - 7 + 7) = (11 + 7).\n   *The equation is now: 2x = 18*\n• **Step 3 (The tight end):** The '2' is attached to the 'x' by multiplication. The opposite is dividing by 2.\n• **Step 4 (Balance):** Divide BOTH sides by 2. (2x ÷ 2) = (18 ÷ 2).\n\n**Final Answer: x = 9.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest trap in Algebra is the **'Invisible 1'**. When you see a letter 'x' completely by itself, there is actually an invisible '1' hiding in front of it! So, x + x is 2x. A catastrophic mistake is when students see 'x - x' and write '1'. No! If you have one 'x' and you subtract one 'x', you have ZERO 'x's left. Also, x times x is x², not 2x. Never forget the invisible numbers!" 
      }
    ]
  },
  decimals: {
    title: "Decimals: The Details Between the Lines",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Breaking the Whole", 
        content: "Whole numbers are great for counting big things like cars or people. But what if you are measuring the time of a 100-meter sprint? The difference between 1st and 2nd place might be tinier than a single second! A **Decimal** is simply a way of cutting a whole number into 10, 100, or 1,000 tiny equal pieces so we can measure things with extreme, laser-like precision." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Decimal Point's Power", 
        content: "The decimal point is the anchor of the entire number system.\n\n• Numbers to the LEFT of the point are Whole numbers (Ones, Tens, Hundreds). They are big and powerful.\n• Numbers to the RIGHT of the point are Fragments (Tenths, Hundredths, Thousandths). The further right you go, the tinier the piece gets.\n• **The Golden Rule:** You can add as many invisible zeros to the FAR RIGHT end of a decimal as you want, and the value never changes! (0.5 is exactly the same as 0.500)." 
      },
      { 
        icon: "?", 
        title: "3. Step-by-Step: Adding & Subtracting Decimals", 
        content: "The only trick to adding or subtracting decimals is lining them up perfectly:\n\n1. **Line up the dots:** Write the numbers vertically, ensuring the decimal points are stacked exactly on top of each other in a perfect vertical line.\n2. **Fill the gaps:** If one number is 'shorter' than the other (like 3.4 and 2.15), add a zero to the end of the short one (3.40) so they match in length.\n3. **Drop the dot:** Before you even start adding, put a decimal point in the answer space, directly under the others.\n4. **Calculate:** Add or subtract exactly like you would with normal whole numbers." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Precision Math", 
        content: "Calculate: **12.4 - 3.85**\n\n• **Step 1 (Line up & Fill):** Write 12.40 on top, and 3.85 underneath. The dots must align!\n• **Step 2 (The setup):** \n   12.40\n -  3.85\n   -----\n• **Step 3 (Calculate):** Starting from the right, you can't do 0 - 5. You must 'borrow' from the 4. The 4 becomes a 3, and the 0 becomes 10.\n• **Step 4:** 10 - 5 = 5. Next column: You can't do 3 - 8. Borrow from the 2. The 2 becomes 1, the 3 becomes 13.\n• **Step 5:** 13 - 8 = 5. Next: 11 - 3 = 8. Drop the dot down!\n\n**Final Answer: 8.55**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "A devastating mistake happens when MULTIPLYING decimals. Students try to 'line up the decimal points' like they do for addition. **Do NOT line up the dots when multiplying!** Instead, ignore the decimals completely. Multiply the numbers as if they were whole numbers (e.g., for 0.3 × 0.4, just do 3 × 4 = 12). Then, count how many digits were behind the decimal points in the original question (1 for the 3, 1 for the 4 = 2 total). Hop the decimal point in your answer 2 spaces to the left. Answer: 0.12!" 
      }
    ]
  },
  multiply: {
    title: "Multiplication: The Shortcut to Addition",
    blocks: [
      { 
        icon: "?", 
        title: "1. The Core Concept: The Ultimate Speed Boost", 
        content: "If you want to count 8 bags of marbles, and each bag has 45 marbles in it, you *could* write out 45 + 45 + 45 + 45 + 45 + 45 + 45 + 45 and spend five minutes adding them up. But mathematicians are lazy—in a good way! **Multiplication** is just a super-fast, turbo-charged shortcut for doing repeated addition. It allows you to process massive quantities of items in seconds." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Commutative Property", 
        content: "Multiplication has a magical property called Commutativity. This is a fancy word that simply means **the order does not matter**.\n\n• If you have 3 rows of 5 chairs (3 × 5), you have 15 chairs.\n• If you rotate the room and look at it as 5 rows of 3 chairs (5 × 3), you still have 15 chairs!\n• 3 × 5 = 5 × 3. This means if you ever forget a difficult times table like 8 × 7, you can just calculate 7 × 8 instead!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Long Multiplication (Column Method)", 
        content: "When multiplying big numbers (like 42 × 35), you must use the Column Method:\n\n1. **Stack them:** Write the big number on top, the smaller on the bottom, lined up on the right.\n2. **The First Wave:** Multiply the top number by the ONES digit of the bottom number. Write the answer down.\n3. **The Golden Zero:** Move down to the next row. Because you are now going to multiply by the TENS digit, you MUST put a magic '0' in the ones column before you do any math!\n4. **The Second Wave:** Multiply the top number by the TENS digit. Write it down next to the zero.\n5. **The Grand Finale:** Add the two rows together." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: 42 × 35", 
        content: "Calculate: **42 × 35**\n\n• **Step 1 (First Wave):** Multiply 42 by the 5. (5 × 2 = 10, write 0 carry 1. 5 × 4 = 20, plus 1 is 21). First row is **210**.\n• **Step 2 (The Golden Zero):** Drop down to the next line. Put a **0** at the end.\n• **Step 3 (Second Wave):** Multiply 42 by the 3. (3 × 2 = 6. 3 × 4 = 12). Write 126 next to the zero. Second row is **1260**.\n• **Step 4 (Add them up):** 210 + 1260.\n\n**Final Answer: 1470.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The absolute most common way to fail long multiplication is forgetting **The Golden Zero** on the second line. If you are multiplying by '35', that '3' isn't really a 3... it's a 30! By putting the magic zero down first, you shift all your answers over by one place value, making sure you are actually multiplying by thirty instead of three. Forget the zero, and your answer will be completely ruined." 
      }
    ]
  },
  sqrt: {
    title: "Square Roots: Un-baking the Cake",
    blocks: [
      { 
        icon: "?", 
        title: "1. The Core Concept: The Mathematical Reverse Gear", 
        content: "If you take a number and multiply it by itself (like 5 × 5), you 'square' it, creating a much bigger number (25). But what if you are given the 25 and told to find the original starting number? That's what a **Square Root (v)** does! It is the mathematical reverse gear. It 'un-bakes' the cake. Taking the square root of a number asks the question: 'What identical twin numbers multiplied together to create this?'" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Perfect Squares vs. Surds", 
        content: "• **Perfect Squares:** These are the nice, friendly numbers that have clean, whole-number roots. (e.g., v9 = 3, v16 = 4, v100 = 10). You MUST memorize the perfect squares up to 12 × 12 = 144.\n• **Surds (Irrational Roots):** Most numbers are not perfect squares! If you try to find v10, the answer is a never-ending, chaotic decimal (3.16227...). We call these messy, unbreakable roots 'Surds'. Often, it's better to just leave them written as v10 rather than writing a messy decimal." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Estimating Ugly Roots", 
        content: "If you are in an exam without a calculator, how do you find the square root of 50?\n\n1. **Find the Neighbors:** Think of the perfect squares that trap the number 50. The perfect square below it is 49 (which is 7×7). The perfect square above it is 64 (which is 8×8).\n2. **Establish the Bracket:** Because 50 is trapped between 49 and 64, the square root of 50 MUST be trapped between 7 and 8.\n3. **Estimate the Decimal:** Look at the gaps. 50 is incredibly close to 49, and very far from 64. Therefore, the answer must be very close to 7, like 7.1!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding v85 without a calculator", 
        content: "Estimate the value of **v85** to one decimal place.\n\n• **Step 1 (Neighbors):** What perfect squares are near 85? We know 9 × 9 = 81. And 10 × 10 = 100.\n• **Step 2 (The Bracket):** Since 85 is between 81 and 100, the answer MUST be 'Nine point something'.\n• **Step 3 (The Gaps):** 85 is only 4 steps away from 81. But it is 15 steps away from 100. It is much closer to the 9 than the 10.\n• **Step 4 (Estimate):** Because it's a little bit past the 9, a highly educated guess would be 9.2.\n\n*(Checking with a calculator, v85 is actually 9.219! Our logic was perfect!)*" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The most embarrassing trap in all of mathematics is thinking that a square root means 'divide by 2'. **v100 is NOT 50!** 50 × 50 is 2,500, not 100! A square root is asking what number multiplied by ITSELF makes the target. The square root of 100 is 10 (because 10 × 10 = 100). Never, ever divide by 2 when you see a square root symbol!" 
      }
    ]
  },
  squaring: {
    title: "Squaring Numbers: The Area Trick",
    blocks: [
      { 
        icon: "?", 
        title: "1. The Core Concept: Building the Box", 
        content: "Why do we call it 'squaring' a number? Because it literally means calculating the area of a perfect square! If you have a square rug that is 5 meters long and 5 meters wide, you multiply 5 × 5 to find that the rug covers 25 square meters. In math, instead of writing 5 × 5, we use a tiny little '2' floating in the air: **5²**. It simply means: 'Multiply this number by an identical copy of itself!'" 
      },
      { 
        icon: "?", 
        title: "2. The Rules: The Danger of Negatives", 
        content: "Squaring positive numbers is easy (4² = 16). But what happens when you square a negative number?\n\n• **The Golden Rule:** When you multiply two negative numbers together, the minus signs instantly destroy each other, creating a POSITIVE answer. (-4) × (-4) = +16.\n• **Therefore:** Any real number you square, whether it started off positive or negative, will ALWAYS result in a positive answer! You can never square a real number and get a negative result." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Trick for Squaring numbers ending in 5", 
        content: "Want to look like a genius? You can instantly square any two-digit number ending in 5 (like 35², 65², 85²) entirely in your head in two seconds!\n\n1. **The Tail:** The answer will ALWAYS end in the number **25**.\n2. **The Head:** Look at the first digit of the number. (For 35, the digit is 3).\n3. **The Multiplier:** Take that digit, and multiply it by the number that comes directly AFTER it in the alphabet of numbers (3 × 4 = 12).\n4. **Combine:** Put the Head in front of the Tail (12 followed by 25 = 1225). Done!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Mental Math Magic", 
        content: "Calculate **75²** in your head, without a calculator.\n\n• **Step 1 (The Tail):** Because it ends in a 5, the answer will finish with **25**.\n• **Step 2 (The Head):** The first digit of 75 is **7**.\n• **Step 3 (Multiply up):** What number comes after 7? It's 8. Multiply them together: 7 × 8 = **56**.\n• **Step 4 (Combine):** Slap the 56 in front of the 25.\n\n**Final Answer: 5625. (Try it on a calculator, it works perfectly!)**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The calculator trap is brutal here. If you want to square the number -6, and you type -6² into a cheap calculator, it will confidently tell you the answer is -36. **The calculator is wrong!** Why? Because without brackets, the calculator only squares the 6 (getting 36) and then sticks the minus sign back on at the end. To tell the calculator to square the NEGATIVE sign too, you MUST type it with brackets: **(-6)²**. This will give you the correct answer of +36." 
      }
    ]
  },
  stdform: {
    title: "Standard Form: Taming the Giants",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Scientist's Shortcut", 
        content: "The universe is filled with numbers that are too massive or too microscopic to write out normally. The distance to the nearest star is roughly 40,000,000,000,000 km. The width of an atom is 0.0000000001 meters. Writing all those zeros takes too long, and it's incredibly easy to make a mistake. **Standard Form** (also called Scientific Notation) is a clever shorthand that packs all those zeros up into a neat little box using the power of 10." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Strict Format", 
        content: "A number is ONLY written in Standard Form if it perfectly matches this exact format: **A × 10n**\n\n• **The 'A' Number:** This front number MUST be between 1 and 10. (It can be exactly 1, but it must be strictly less than 10. So 3.5 is allowed, but 12.4 is NOT allowed).\n• **The 'n' Power:** This little floating number tells you how many times to hop the decimal point. \n• If 'n' is **Positive**, the true number is HUGE (hop right).\n• If 'n' is **Negative**, the true number is MICROSCOPIC (hop left)." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Converting to Standard Form", 
        content: "How to pack a giant number (like 8,400,000) into the box:\n\n1. **Find the dot:** Every whole number has a hidden decimal point at the very end (8400000.0).\n2. **Hop the dot:** Jump the decimal point to the left until you create a number between 1 and 10. (Jump it between the 8 and 4 to make 8.4).\n3. **Count the hops:** Count exactly how many 'jumps' the decimal point had to make. (It made 6 jumps).\n4. **Write the formula:** Write your new number (8.4), write '× 10', and make the number of jumps your power!\n*(Result: 8.4 × 106)*" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Microscopic Bug", 
        content: "Convert the tiny number **0.000037** into Standard Form.\n\n• **Step 1:** We need to jump the decimal point to create a number between 1 and 10.\n• **Step 2:** We must jump it to the RIGHT, placing it right between the 3 and the 7 to create **3.7**.\n• **Step 3 (Count hops):** We hopped the point exactly 5 spaces to the right.\n• **Step 4 (The Power):** Because the original number was microscopic (a decimal starting with 0), the power must be NEGATIVE. So the power is -5.\n\n**Final Answer: 3.7 × 10?5**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "A classic exam trick is to give you a number like **45 × 104** and ask you if it's in Standard Form. Students see the '× 104' and confidently say YES. **WRONG!** Look at the front number: 45. The Golden Rule states the front number MUST be between 1 and 10. Since 45 is too big, this is fake standard form! To fix it, you must shrink the 45 down to 4.5 (make it ten times smaller), and to balance it out, increase the power by one! True answer: 4.5 × 105." 
      }
    ]
  },
  surds: {
    title: "Surds: The Untamable Roots",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Raw Numbers", 
        content: "When you type the square root of 9 into a calculator, you get a beautiful, clean '3'. But if you type the square root of 2, the calculator spits out '1.41421356...'. It's a chaotic decimal that goes on forever with no pattern. This chaotic number is called a **Surd**. In advanced mathematics, we don't want messy, rounded-off decimals. We want absolute purity and perfection! So, instead of converting it to a decimal, we leave it in its 'raw' form inside the root symbol: **v2**. That is the exact, perfect answer." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Simplifying Surds", 
        content: "Just like you wouldn't leave a fraction as 10/20 (you'd simplify it to 1/2), you shouldn't leave a surd as v20. You must simplify it!\n\n• **The Multiplication Rule:** va × vb = v(ab). (e.g., v2 × v3 = v6).\n• **The Prison Break:** The goal of simplifying is to find a 'perfect square' hiding inside the surd, and break it out of the square root prison." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Prison Break Method", 
        content: "How to simplify a big, ugly surd like v50:\n\n1. **Hunt for Squares:** Think of the perfect square numbers (4, 9, 16, 25, 36, 49...). Does one of these divide perfectly into 50?\n2. **Split the Cell:** Yes! 25 divides into 50 exactly 2 times. Rewrite v50 as v(25 × 2).\n3. **Separate them:** Using the multiplication rule, split them into two separate roots: v25 × v2.\n4. **The Breakout:** The v25 is a perfect square! It easily breaks out of the root symbol and transforms into a clean, normal **5**.\n5. **The Remainder:** The v2 cannot escape. It stays behind. We write the final answer with the free number glued to the trapped number: **5v2**." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Adding Surds", 
        content: "Simplify: **v12 + v27**\n*(Warning: You CANNOT just add them to make v39! Surds act like algebra letters. You can't add an 'x' to a 'y'. You must simplify them first!)*\n\n• **Step 1 (Simplify v12):** 4 is a perfect square that fits into 12. So v12 = v(4 × 3) = v4 × v3 = **2v3**.\n• **Step 2 (Simplify v27):** 9 is a perfect square that fits into 27. So v27 = v(9 × 3) = v9 × v3 = **3v3**.\n• **Step 3 (Add them up):** We now have 2v3 + 3v3.\n• **Step 4:** Treat the v3 like an 'x'. If you have 2x + 3x, you have 5x!\n\n**Final Answer: 5v3**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The deadliest, most unforgivable sin in surds is thinking that you can ADD numbers while they are trapped inside separate roots. **v16 + v9 does NOT equal v25!** Let's prove it: v16 is 4. v9 is 3. And 4 + 3 = 7. But v25 is 5! And 7 does not equal 5! You can multiply surds together (v2 × v3 = v6), but you can NEVER add them together unless the number inside the root is exactly the same (like 2v3 + 4v3 = 6v3)." 
      }
    ]
  },
  banking: {
    title: "Banking & Interest: Making Money Work",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Price of Money", 
        content: "When you put money in a bank, you aren't just storing it; you are actually *lending* it to the bank! Because they are using your money, they pay you a 'thank you' fee called **Interest**. Conversely, if you borrow money for a car, you must pay the bank an extra fee. Understanding how interest grows is the single most important math skill for building real wealth and avoiding massive debt in your adult life." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Simple vs. Compound", 
        content: "There are two entirely different ways interest can grow:\n\n• **Simple Interest (The Slow Burn):** You only ever earn interest on the original starting amount. If you put in  and earn  a year, you will get exactly  every single year forever. It grows in a boring, straight line.\n• **Compound Interest (The Snowball):** You earn interest on your starting amount AND on the interest you earned previously! It's like a snowball rolling down a hill, gathering more and more snow, growing faster and faster every year. This is how millionaires are made." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Compound Formula", 
        content: "To calculate Compound Interest, we use a powerful formula: **Total = P × (Multiplier)n**\n\n1. **Find 'P' (Principal):** This is your starting amount of money.\n2. **Create the Multiplier:** Start with 100%. Add the interest rate (e.g., 5% interest makes 105%). Convert that to a decimal by dividing by 100 (105 ÷ 100 = **1.05**). This is your multiplier!\n3. **Find 'n' (Time):** This is the number of years the money is sitting in the bank.\n4. **Calculate:** Plug it all into a calculator: Starting Money × Multiplier to the power of Years!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The 3-Year Investment", 
        content: "You invest  in a bank account that pays 4% Compound Interest per year. How much money will you have in total after 3 years?\n\n• **Step 1 (Principal):** P = .\n• **Step 2 (Multiplier):** 100% + 4% = 104%. As a decimal, the multiplier is **1.04**.\n• **Step 3 (Time):** The time 'n' is 3 years.\n• **Step 4 (The Equation):** Total = 2000 × (1.04)³\n• **Step 5 (Calculate):** 2000 × 1.124864 = 2249.728.\n\n**Final Answer: You will have ,249.73 (always round money to 2 decimal places!).**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "When asked 'How much INTEREST was earned?', students often use the formula, get an answer like ,249.73, and just write that down as their final answer. **Wrong!** That number is the TOTAL amount in the bank account! The question only asked for the *interest* (the extra free money). You must take your final total and SUBTRACT your original starting money. (,249.73 -  = .73). The interest earned was only .73! Read the question carefully!" 
      }
    ]
  },
  heron: {
    title: "Heron's Formula: The Triangle Master",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Area without Height", 
        content: "Since primary school, you've been taught the golden rule of triangles: Area = ½ × Base × Height. But what if you are standing in a massive field shaped like a triangle, and you can only measure the lengths of the three fences? You don't know the perpendicular height, and you have no way to measure it! Over 2000 years ago, a genius named Hero of Alexandria created **Heron's Formula**—a magical equation that lets you calculate the exact area of ANY triangle using nothing but the lengths of its three sides!" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Magic 's'", 
        content: "The formula is incredibly powerful, but it requires a secret ingredient called **'s' (the semi-perimeter)**.\n\n• The perimeter is the total distance around the outside of the triangle (a + b + c).\n• The 'semi-perimeter' (s) is simply exactly HALF of the perimeter.\n• So, **s = (a + b + c) ÷ 2**.\n• You CANNOT use Heron's formula until you have calculated 's' first!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Executing the Formula", 
        content: "Once you have your three sides (a, b, c) and your semi-perimeter (s), here is the master formula: **Area = v( s(s-a)(s-b)(s-c) )**\n\n1. Calculate 's' by adding all three sides and halving the total.\n2. Calculate the three 'differences' in brackets: (s minus side a), (s minus side b), and (s minus side c).\n3. Multiply all four numbers together: 's' multiplied by all three of the differences you just calculated.\n4. Take the massive number you just created, and hit the Square Root button on your calculator. Boom! You have the area." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Farmer's Field", 
        content: "A triangular field has sides of 13m, 14m, and 15m. Find its exact area.\n\n• **Step 1 (Find 's'):** Add the sides: 13 + 14 + 15 = 42. Divide by 2. **s = 21**.\n• **Step 2 (The differences):** \n   (s - a) = 21 - 13 = 8\n   (s - b) = 21 - 14 = 7\n   (s - c) = 21 - 15 = 6\n• **Step 3 (Multiply them all):** Area = v( 21 × 8 × 7 × 6 )\n• **Step 4 (Calculate inside):** 21 × 8 × 7 × 6 = 7056.\n• **Step 5 (Square Root):** Area = v7056 = 84.\n\n**Final Answer: The area is exactly 84 m²!**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The two biggest mistakes students make are: 1) Forgetting to divide the perimeter by 2 when calculating 's'. If you use the full perimeter, the formula will completely self-destruct. 2) Forgetting to multiply by 's' right at the front of the square root! The formula is v(s × ...), not just the differences multiplied together. Make sure that lonely 's' at the front of the brackets gets multiplied with everything else before you hit the square root button!" 
      }
    ]
  },
  profitloss: {
    title: "Profit and Loss: The Mathematics of Business",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Hustle", 
        content: "If you buy a rare comic book for  and sell it to your friend for , you just made a  **Profit**. You're a business genius! But if nobody wants it and you have to panic-sell it for , you suffered a  **Loss**. Business mathematics isn't just about addition and subtraction; it's about calculating those profits and losses as a *percentage* so investors can compare completely different businesses on a level playing field." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Golden Denominator", 
        content: "To find your percentage profit or loss, you must use a fraction, and then multiply by 100.\n\n• The formula is: **(Difference ÷ ORIGINAL Price) × 100**\n• The Difference is simply how much money you made or lost (e.g., you made ).\n• The **Golden Rule:** The number on the bottom of the fraction MUST ALWAYS BE THE ORIGINAL COST PRICE! It is never the selling price. Investors only care about what percentage return they got based on the money they *originally invested*." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Calculating Percentage Profit", 
        content: "1. **Find the Difference:** Subtract the two prices (Buy Price and Sell Price) to find the absolute amount of money gained or lost in dollars.\n2. **Identify the Original:** Find the price the item was ORIGINALLY bought for. (The starting point).\n3. **Build the Fraction:** Put the Difference on top, and the Original Price on the bottom.\n4. **Convert to %:** Divide the top by the bottom, and multiply the answer by 100!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Car Flip", 
        content: "Sarah buys a used car for . She cleans it up and sells it for . Calculate her percentage profit.\n\n• **Step 1 (Find Difference):** She sold it for 4800 and bought it for 4000. Her profit is .\n• **Step 2 (Find Original):** The original starting price she paid was .\n• **Step 3 (Build Fraction):** 800 / 4000.\n• **Step 4 (Calculate):** 800 ÷ 4000 = 0.2. \n• **Step 5 (Convert to %):** 0.2 × 100 = 20%.\n\n**Final Answer: Sarah made a 20% profit.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The single biggest disaster in business math is putting the SELLING PRICE on the bottom of the fraction. In the example above, if you mistakenly put the  on the bottom (800 / 4800), you would get an answer of 16.6%. This is completely wrong and will lose you all the marks! The math world (and the business world) only cares about the percentage return on the ORIGINAL investment. **Always, always, always put the original 'Bought' price on the bottom!**" 
      }
    ]
  }
};

for (const [key, data] of Object.entries(batch4)) {
  const filePath = path.join(__dirname, 'learnContent', key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log('Batch 4 successfully written!');

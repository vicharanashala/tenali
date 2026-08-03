const fs = require('fs');
const path = require('path');

const batch3 = {
  prob: {
    title: "Probability: The Math of Chance",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Predicting the Unpredictable", 
        content: "If you flip a coin, you can't guarantee it will land on Heads. But if you flip it a million times, you know exactly how many times it *should* land on Heads (about half). **Probability** is the mathematical way of predicting the future when things are random. It tells you exactly how likely an event is to happen. From predicting the weather to winning the lottery to calculating insurance rates, probability runs our chaotic world!" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The 0 to 1 Scale", 
        content: "Probability is always measured on a strict scale from 0 to 1 (or 0% to 100%).\n\n• **0 (Impossible):** It can never happen. (e.g., rolling a 7 on a standard 6-sided die).\n• **0.5 or ½ (Even Chance):** It is a 50/50 toss-up. (e.g., flipping Heads on a coin).\n• **1 (Certain):** It is absolutely guaranteed to happen. (e.g., the sun rising tomorrow).\n• A probability can NEVER be a negative number, and it can NEVER be bigger than 1." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Golden Formula", 
        content: "To calculate the probability of any event happening, you only need one simple fraction:\n\n**Probability = (Number of Winning Outcomes) ÷ (Total Possible Outcomes)**\n\n1. Count how many ways you can 'win' or get what you want.\n2. Count the absolute total number of things that could possibly happen.\n3. Put the winning number on top, the total on the bottom, and simplify the fraction!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Marble Bag", 
        content: "A bag contains 3 Red marbles, 2 Blue marbles, and 5 Green marbles. You close your eyes and pick one. What is the probability of picking a Red marble?\n\n• **Step 1 (Winning Outcomes):** How many Red marbles are there? There are 3. So the top of our fraction is 3.\n• **Step 2 (Total Outcomes):** How many marbles are in the bag altogether? 3 + 2 + 5 = 10. The bottom of our fraction is 10.\n• **Step 3 (The Fraction):** The probability is 3/10 (or 0.3, or 30%).\n\n**Final Answer: The probability is 3/10.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest trap in probability happens when doing two things in a row (like picking a marble, keeping it, and then picking another). This is called 'Without Replacement'. Students often forget that if you keep a marble, the **Total Number of marbles in the bag decreases by 1** for the second pick! If there were 10 marbles, the next fraction MUST have a 9 on the bottom. Always ask yourself: 'Did the total amount change?'" 
      }
    ]
  },
  circleth: {
    title: "Circle Theorems: Geometry's Hidden Rules",
    blocks: [
      { 
        icon: "?", 
        title: "1. The Core Concept: The Perfect Loop", 
        content: "A circle isn't just a round shape; it is a perfectly symmetrical mathematical object where every point on the edge is the exact same distance from the center. Because of this absolute perfection, whenever you draw lines and triangles inside a circle, they follow strict, hidden, magical rules. These rules are called **Circle Theorems**, and they allow you to instantly find missing angles just by recognizing a specific pattern." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Big Three Theorems", 
        content: "There are many theorems, but these three are the most famous:\n\n• **The Arrowhead (Angle at the Center):** The angle at the center of the circle is always exactly DOUBLE the angle at the edge (circumference), as long as they start from the same two points.\n• **The Bowtie (Angles in the same segment):** If you draw a 'bowtie' shape starting from two bottom points, the two 'ears' at the top of the bowtie are always EQUAL.\n• **The Semi-Circle:** Any triangle drawn inside a half-circle, where the longest side goes directly through the center point, will ALWAYS have a perfect 90° right angle at the top edge!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Cracking the Code", 
        content: "When faced with a terrifying circle geometry puzzle with a dozen crossing lines:\n\n1. **Find the Center:** Is the center point marked? If yes, look immediately for the 'Arrowhead' theorem or a 'Semi-Circle' triangle.\n2. **Look for Radii:** Any line going from the center to the edge is a radius. They are all equal length! Two radii make an Isosceles triangle (two equal angles). This is the secret to solving 50% of puzzles.\n3. **Hunt for Bowties:** Trace from two points on the edge and see if they make a bowtie shape touching the top edge." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Isosceles Trap", 
        content: "A triangle is drawn inside a circle. The center of the circle 'O' is the top point of the triangle. The two bottom points A and B are on the edge. The angle at 'O' is 100°. Find the angle at A.\n\n• **Step 1:** The lines OA and OB both go from the center to the edge. That means they are both Radii.\n• **Step 2:** Because they are both Radii, they are the exact same length. Therefore, triangle OAB is Isosceles!\n• **Step 3:** In an Isosceles triangle, the two bottom angles must be equal.\n• **Step 4:** A triangle has 180°. 180° - 100° = 80° left for the bottom two angles.\n• **Step 5:** Split the 80° equally between A and B. 80 / 2 = 40°.\n\n**Final Answer: Angle A is 40°.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The deadliest trap in Circle Theorems is assuming a line goes exactly through the center just because it looks like it does. **If there is no dot labeled 'O' or 'Center', DO NOT assume it's the diameter!** If it's not the diameter, you cannot use the Semi-Circle 90° rule. Geometry diagrams are designed to trick your eyes. Only trust the written facts, never the drawing!" 
      }
    ]
  },
  conics: {
    title: "Conic Sections: Slicing the Cone",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The 3D Slices", 
        content: "Imagine holding a solid 3D cone (like an ice cream cone) and a massive, perfectly flat samurai sword. Depending on the exact angle you swing the sword through the cone, the flat surface of the slice will reveal a completely different 2D shape. These shapes—Circles, Ellipses, Parabolas, and Hyperbolas—are called **Conic Sections**. They aren't just cool shapes; they dictate the orbits of planets, the curve of satellite dishes, and the path of comets through space!" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Four Cuts", 
        content: "The angle of your sword changes everything:\n\n• **The Circle:** Slice perfectly horizontally, parallel to the base of the cone.\n• **The Ellipse (Oval):** Slice at a slight, shallow angle. The shape is closed but stretched out.\n• **The Parabola:** Slice at an angle perfectly parallel to the sloped edge of the cone itself. The shape blasts out the bottom and never closes.\n• **The Hyperbola:** Slice straight down vertically. This actually cuts through two cones stacked point-to-point, creating two mirrored curves facing away from each other." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Identifying from the Equation", 
        content: "You don't need a sword; you can identify the shape just by looking at its algebra equation!\n\n1. **Get it in form:** Look at the x² and y² terms.\n2. **Circle:** x² and y² both exist, both are positive, and they have the exact SAME number in front of them (e.g., 3x² + 3y² = 9).\n3. **Ellipse:** x² and y² both exist, both are positive, but they have DIFFERENT numbers in front of them (e.g., 2x² + 5y² = 10).\n4. **Parabola:** Only ONE of the variables is squared! (e.g., y = x² + 2, or x = y² - 4).\n5. **Hyperbola:** x² and y² both exist, but one of them has a NEGATIVE sign (they are subtracting). (e.g., x² - y² = 1)." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Detective Work", 
        content: "Identify the shape created by this equation: **4x² - 9y² = 36**\n\n• **Step 1:** Look at the squared terms. We have both an x² and a y². This means it is NOT a parabola.\n• **Step 2:** Look at the signs. The x² is positive, but the y² has a massive minus sign in front of it!\n• **Step 3:** Because one is positive and one is negative (they are subtracting), the slice must be vertical.\n\n**Final Answer: This is a Hyperbola.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "A common mistake when graphing Ellipses is mixing up the 'Major Axis' (the long way across) and the 'Minor Axis' (the short way across). The major axis ALWAYS corresponds to the variable sitting on top of the LARGER denominator in the standard equation. Just because x comes first in the alphabet doesn't mean the oval is stretched horizontally! If the number under y² is bigger, the oval stands up tall like an egg!" 
      }
    ]
  },
  transform: {
    title: "Transformations: Moving the World",
    blocks: [
      { 
        icon: "???", 
        title: "1. The Core Concept: The Geometry Video Game", 
        content: "Every time you move a character in a video game, rotate your phone screen, or look in a mirror, you are experiencing mathematical **Transformations**. A transformation is simply taking a shape on a graph and moving it, spinning it, flipping it, or stretching it. The original shape is called the 'Object', and the new, transformed shape is called the 'Image'." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Four Movements", 
        content: "There are four main ways to transform a shape:\n\n• **Translation (Slide):** Sliding the shape left, right, up, or down. It doesn't turn or flip; it just moves to a new postcode.\n• **Reflection (Flip):** Flipping the shape perfectly across a mirror line. It will look exactly the same, but backwards.\n• **Rotation (Spin):** Pinning the graph with a needle at a specific 'center' point, and spinning the shape around it like a clock hand.\n• **Enlargement (Stretch/Shrink):** Making the shape bigger or smaller from a specific 'center' point using a 'Scale Factor'." 
      },
      { 
        icon: "???", 
        title: "3. Step-by-Step: Executing a Translation", 
        content: "Translations are usually described using a **Column Vector**, like [3, -5].\n\n1. **Read the Vector:** The top number is Left/Right (positive=Right, negative=Left). The bottom number is Up/Down (positive=Up, negative=Down).\n2. **Pick a Corner:** Don't try to move the whole shape at once! Pick just ONE corner (vertex) of the shape.\n3. **Walk the Path:** From that corner, count the steps right/left, and then up/down as instructed by the vector. Draw a dot at the final destination.\n4. **Repeat:** Do this for every single corner of the shape.\n5. **Connect the Dots:** Use a ruler to connect your new dots. You have just slid the entire shape!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Sliding a Triangle", 
        content: "A triangle has a corner at the coordinate (2, 4). You must translate the triangle using the vector [-3, 1]. Where does that corner end up?\n\n• **Step 1 (Read the vector):** The top is -3, meaning go LEFT 3 spaces. The bottom is +1, meaning go UP 1 space.\n• **Step 2 (The X movement):** The corner starts at x=2. We go left 3. (2 - 3 = -1).\n• **Step 3 (The Y movement):** The corner starts at y=4. We go up 1. (4 + 1 = 5).\n• **Step 4 (The new dot):** Our new corner coordinate is (-1, 5).\n\n**Final Answer: The corner moves to (-1, 5).**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The most brutal mistake in Transformations happens during **Rotations**. Students will happily spin the shape 90° clockwise, but they forget to use the specified **Center of Rotation**. If the question says 'Rotate 90° around the point (1,1)', you cannot just spin the shape around the middle of the graph (0,0)! You must place your tracing paper needle exactly on (1,1) before you spin. If your center is wrong, the shape will end up miles away from where it should be!" 
      }
    ]
  },
  mensur: {
    title: "Mensuration: Measuring 2D & 3D Space",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The World Builders", 
        content: "If you want to paint your bedroom walls, fill a swimming pool with water, or wrap a birthday present, you are doing **Mensuration**. It is the mathematical measurement of 2D shapes (finding their Perimeter and Area) and 3D solids (finding their Surface Area and Volume). It's the ultimate bridge between abstract math and physical reality!" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Big Three Concepts", 
        content: "You must clearly separate these three concepts in your mind:\n\n• **Perimeter (1D):** The total distance walking around the outside edge of a shape. Measured in flat units (cm, m).\n• **Area (2D):** The amount of flat space a shape takes up (like a carpet on the floor). Measured in square units (cm², m²).\n• **Volume (3D):** The amount of 3D space inside a solid object (how much water it can hold). Measured in cubic units (cm³, m³)." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Prism Secret", 
        content: "A 'Prism' is a 3D shape that looks exactly the same all the way through, like a Toblerone box (triangular prism) or a soda can (cylinder). There is a master cheat-code formula to find the volume of ANY prism in the universe:\n\n1. **Find the Face (Cross-Section):** Identify the front face of the shape (the part that stays exactly the same if you sliced it like a loaf of bread).\n2. **Calculate the 2D Area:** Use normal 2D formulas (Area of a triangle, Area of a circle) to find the area of just that front face.\n3. **Multiply by the Length:** Take that 2D area, and multiply it by how 'deep' or 'long' the 3D shape goes.\n\n**Master Formula:** Volume = Area of Cross-Section × Length" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Volume of a Cylinder", 
        content: "Find the volume of a cylinder (a soda can). The circle on top has a radius of 3cm. The can is 10cm tall.\n\n• **Step 1 (Find the Face):** The face of a cylinder is a Circle.\n• **Step 2 (Area of the Face):** The formula for a circle is Area = pr². So, Area = p × 3² = 9p. (Which is roughly 28.27 cm²).\n• **Step 3 (Multiply by Length):** The can goes 10cm deep (tall). So multiply the face area by 10.\n• **Step 4:** 28.27 × 10 = 282.7.\n\n**Final Answer: The volume is 282.7 cm³.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The absolute classic trap in Mensuration is the **Units Trap**. The question will say 'A rectangular room is 4 meters long and 300 centimeters wide. Find the area.' Students immediately do 4 × 300 = 1200. **WRONG!** You cannot multiply meters by centimeters! You must convert them to the exact SAME unit before you do any math. Change the 300cm into 3m. Then do 4m × 3m = 12m²." 
      }
    ]
  },
  bounds: {
    title: "Upper and Lower Bounds: The Limits of Accuracy",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Illusion of Perfection", 
        content: "In the real world, absolute perfection doesn't exist. If you weigh a bag of flour and the scale says '500g', it isn't exactly 500.000000g. It might actually be 500.4g, but the scale rounded it down! **Bounds** is the study of the 'hidden wiggle room' behind every rounded measurement. It helps engineers and scientists calculate the absolute maximum or absolute minimum a measurement could truly be before the rounding happened." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Halfway Rule", 
        content: "To find the Upper and Lower limits (bounds) of any rounded number, follow the Golden Halfway Rule:\n\n• Look at what the number was rounded to (e.g., 'nearest 10', 'nearest whole number', '1 decimal place').\n• **Halve that degree of accuracy.** (e.g., half of 10 is 5. Half of 1 is 0.5).\n• **Lower Bound:** SUBTRACT that half-value from your number. (This is the absolute smallest the real number could be).\n• **Upper Bound:** ADD that half-value to your number. (This is the absolute biggest the real number could be)." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Max and Min Calculations", 
        content: "Things get tricky when you have to calculate an Area or Speed using rounded numbers.\n\n1. **Find all bounds first:** Before doing any math, find the Upper and Lower bounds for every single number in the question.\n2. **To find the Maximum Answer (Upper Bound):** Use logic! To get the biggest Area (A = length × width), you must multiply the biggest Upper length by the biggest Upper width.\n3. **The Division Trap:** To get the Maximum Answer when dividing (like Speed = Distance ÷ Time), you must divide the BIGGEST Upper Distance by the SMALLEST Lower Time! (Dividing by a tiny number makes the answer huge)." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding the Bounds", 
        content: "A wooden plank is measured as 40cm, rounded to the nearest 10cm. What is the absolute shortest and longest this plank could truly be?\n\n• **Step 1 (The Accuracy):** The question says it was rounded to the 'nearest 10cm'.\n• **Step 2 (The Halfway Rule):** Half of 10cm is **5cm**.\n• **Step 3 (Lower Bound):** Subtract 5 from 40. 40 - 5 = **35cm**.\n• **Step 4 (Upper Bound):** Add 5 to 40. 40 + 5 = **45cm**.\n\n**Final Answer: The plank's true length is trapped between 35cm and 45cm (35 = Length < 45).**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The most dangerous trap is calculating the **Lower Bound of a Division** (like finding minimum speed). Students naturally think 'Minimum means I must use all the small Lower Bounds'. So they divide Lower Distance by Lower Time. **WRONG!** Think about sharing a pizza. To get the smallest slice possible, you want a small pizza (Lower Distance) divided by a MASSIVE amount of friends (Upper Time). The rule for Minimum Division is ALWAYS: **Lower ÷ Upper!**" 
      }
    ]
  },
  shares: {
    title: "Shares & Percentages: Slicing the Pie",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Universal Language of Parts", 
        content: "Fractions, Decimals, and Percentages are basically identical triplets wearing different clothes. They all do the exact same job: they describe a piece of a whole. 'Percent' literally translates from Latin as 'per 100'. So, 25% just means 25 slices out of a 100-slice pizza. Mastering how to bounce between these three forms, and how to take 'pieces' of larger numbers, is the most useful real-world math skill you will ever learn." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Golden Triangle", 
        content: "You must know how to instantly translate between the triplets:\n\n• **Fraction to Decimal:** Simply divide the top number by the bottom number (e.g., 3/4 is 3 ÷ 4 = 0.75).\n• **Decimal to Percentage:** Multiply by 100! Just slide the decimal point two spots to the right (e.g., 0.75 becomes 75%).\n• **Percentage to Decimal:** Divide by 100! Slide the decimal point two spots to the left (e.g., 8% becomes 0.08, NOT 0.8!)." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Multiplier Trick", 
        content: "When a store has a '20% off Sale', do not find 20% and then subtract it! That takes too long. Use a **Decimal Multiplier** instead:\n\n1. **Start with 100%:** The original price is always 100%.\n2. **Adjust the percentage:** If it's a 20% discount, do 100% - 20% = 80%. (You are paying for 80% of the item).\n3. **Convert to Decimal:** Turn that 80% into a decimal by dividing by 100. (80 ÷ 100 = 0.80).\n4. **The One-Shot Calculation:** Multiply the original price by 0.80. Boom! You have the final sale price in one step." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Adding Tax", 
        content: "A new phone costs . The government adds a 15% tax on top. What is the final price?\n\n• **Step 1:** Original price is 100%. Tax ADDS 15%.\n• **Step 2:** 100% + 15% = 115%. (You are paying 115% of the original cost).\n• **Step 3 (Decimal Multiplier):** Turn 115% into a decimal. 115 ÷ 100 = **1.15**.\n• **Step 4 (Calculate):** Multiply the price by the multiplier: 400 × 1.15.\n\n**Final Answer: The final price is .**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The 'Reverse Percentage' trap is ruthless. An item is on sale for 20% off. The sale price is . What was the original price? Students instantly calculate 20% of  () and add it back on to get . **WRONG!** You cannot take 20% of the *new* price; the 20% was taken off the *old unknown* price! Instead, realize that  represents 80% of the original. Set up an equation: 0.80 × Original = . Then divide! ( ÷ 0.80 = ). The original was !" 
      }
    ]
  },
  linprog: {
    title: "Linear Programming: Finding the Perfect Solution",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The CEO's Dilemma", 
        content: "Imagine you are the CEO of a shoe factory. You want to make as much profit as possible, but you are trapped by real-world limits: you only have a certain amount of leather, a certain number of workers, and limited warehouse space. **Linear Programming** is a visual mathematical technique used by massive corporations to navigate these limits (inequalities) and find the absolute perfect sweet spot that maximizes profit without breaking any rules!" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Shading the Danger Zone", 
        content: "In Linear Programming, the rules of the factory are written as 'Inequalities' (like x + y = 10).\n\n• You draw these inequalities as straight lines on a graph.\n• A solid line means the rule includes 'equal to' (= or =).\n• A dashed line means it strictly cannot equal the line (< or >).\n• **The Golden Shading Rule:** Always lightly shade or cross out the region that is WRONG (the area you are not allowed to be in). The completely un-shaded, empty white space left over in the middle is your safe 'Feasible Region'." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Finding the Maximum Profit", 
        content: "Once you have your blank 'Feasible Region' polygon mapped out on the graph, how do you find the best solution?\n\n1. **The Corner Trick:** Mathematical law states that the absolute maximum (and absolute minimum) profit will ALWAYS occur exactly on one of the sharp corners (vertices) of your safe region polygon.\n2. **Find the Coordinates:** Read the (x, y) coordinates for every corner of your polygon.\n3. **Test them all:** Take the 'Profit Formula' given in the question (e.g., Profit = 5x + 10y) and plug the coordinates of every corner into it.\n4. **The Winner:** Whichever corner gives you the highest number is your perfect manufacturing sweet spot!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Testing the Corners", 
        content: "You've drawn the graph and found the safe region. The three corners of your polygon are A(0, 10), B(4, 6), and C(8, 0). Your Profit formula is **P = 20x + 15y**. Which corner gives the most profit?\n\n• **Test Corner A (0, 10):** P = 20(0) + 15(10) = 0 + 150 = ****.\n• **Test Corner B (4, 6):** P = 20(4) + 15(6) = 80 + 90 = ****.\n• **Test Corner C (8, 0):** P = 20(8) + 15(0) = 160 + 0 = ****.\n\n**Final Answer: Corner B is the winner! You should make 4 of item x and 6 of item y to get a maximum profit of .**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest disaster in Linear Programming is shading the wrong side of a line. If the rule is y = x + 2, how do you know which side is less than? **Use a Test Point!** Pick a really easy coordinate, like (0,0). Plug x=0 and y=0 into the rule. 0 = 0 + 2. Is 0 less than 2? Yes! That means the point (0,0) is in the SAFE zone. Shade the completely opposite side of the line to block off the danger zone. If you guess the shading, your safe region will be completely wrong." 
      }
    ]
  },
  tatsavit: {
    title: "Logical Puzzles: Thinking Like a Detective",
    blocks: [
      { 
        icon: "??????", 
        title: "1. The Core Concept: The Mind Gym", 
        content: "Not all math requires a calculator. Some of the most powerful mathematics in the world requires nothing but pure, unbreakable logic. **Logical Puzzles** are the ultimate workout for your brain. They force you to read carefully, identify hidden rules, eliminate impossible options, and build a chain of reasoning to uncover the hidden truth. This is exactly how computer programmers, detectives, and lawyers train their minds!" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Chain of Truth", 
        content: "Logic puzzles follow strict laws:\n\n• **No Contradictions:** A true solution cannot break any of the rules given in the puzzle. If your answer breaks even one minor rule, the whole answer is wrong.\n• **The Law of Excluded Middle:** In true/false logic, an exact statement must be entirely true or entirely false. There is no 'maybe'.\n• **Process of Elimination:** Sometimes, the fastest way to find the right answer is to systematically destroy all the wrong answers until only one impossible survivor remains." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Grid Method", 
        content: "When faced with a puzzle like 'Alice, Bob, and Charlie have a Red, Blue, and Green car, but Bob hates Green...', the best weapon is a Logic Grid:\n\n1. **Draw a Table:** Write the names down the left side, and the car colors along the top.\n2. **Read Clue 1:** If a clue gives a definite NO (e.g., Bob hates Green), put a big 'X' in Bob's Green box.\n3. **Read Clue 2:** If a clue gives a definite YES (e.g., Alice has the Red car), put a big 'O' in Alice's Red box.\n4. **The Sweep:** If Alice has the Red car, no one else can have it! Put X's in the rest of the Red column. And Alice can't have any other car, so put X's in the rest of her row.\n5. **Repeat:** Keep sweeping and reading clues until the grid is full." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Fruit Thief", 
        content: "Someone stole an Apple. \nDan says: 'Eve did it.' \nEve says: 'Fred did it.' \nFred says: 'Eve is lying.' \n**Only ONE person is telling the truth.** Who stole the apple?\n\n• **Step 1:** Look for contradictions. Eve says Fred did it, and Fred says Eve is lying. They can't both be telling the truth! They are complete opposites.\n• **Step 2:** Because one MUST be the truthteller and one MUST be a liar, the third person (Dan) HAS to be a liar. (Since there is only one truthteller total).\n• **Step 3:** If Dan is a liar, his statement 'Eve did it' is FALSE.\n• **Step 4:** Therefore, Eve did NOT do it.\n*(Advanced: Eve is also lying because if Fred did it, Dan's lie works out. Fred is the truthteller!)*" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest trap in logical reasoning is **assuming information that isn't explicitly written down**. If a puzzle says 'John has a dog', you cannot assume the dog is his ONLY pet. You cannot assume the dog is a boy. You cannot assume John likes the dog! You must act like a ruthless robot and only use the exact, literal facts printed on the page. Assuming things will destroy your logic chain." 
      }
    ]
  },
  basicarith: {
    title: "Basic Arithmetic: The Foundation of Math",
    blocks: [
      { 
        icon: "???", 
        title: "1. The Core Concept: The Bedrock", 
        content: "Everything in mathematics, from simple fractions to the advanced calculus used to launch rockets, is built on four fundamental pillars: Addition, Subtraction, Multiplication, and Division. **Basic Arithmetic** isn't just about doing calculations in your head; it's about understanding the deep, unbreakable rules of how numbers interact. If your foundation is strong, the entire skyscraper of advanced math will be easy to build." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Order of Operations (BODMAS)", 
        content: "If I ask you to solve '2 + 3 × 4', is the answer 20 or 14? If we didn't have rules, math would be chaos! We use **BODMAS** (or PEMDAS) as the universal traffic light system to tell us what to calculate first:\n\n• **B (Brackets):** Always solve the inside of brackets first.\n• **O (Orders/Powers):** Next, solve any squared numbers or square roots.\n• **D & M (Divide & Multiply):** Next, do all division and multiplication, reading from left to right.\n• **A & S (Add & Subtract):** Finally, do all addition and subtraction, reading from left to right. \n*(So, 2 + 3 × 4 = 14, because multiplication comes before addition!)*" 
      },
      { 
        icon: "?", 
        title: "3. Step-by-Step: Surviving Negative Numbers", 
        content: "Negative numbers act like a battle between a Hot Army (+) and a Cold Army (-):\n\n1. **Adding/Subtracting:** If you have -5 + 8, think of 5 Cold soldiers fighting 8 Hot soldiers. They cancel each other out one-by-one. You are left with 3 Hot soldiers (+3). \n2. **Clashing Signs:** If two signs are touching each other (like 5 - - 3), they react! Two of the SAME signs (+ + or - -) merge to form a PLUS. Two DIFFERENT signs (+ - or - +) merge to form a MINUS. So, 5 - - 3 becomes 5 + 3 = 8.\n3. **Multiplying/Dividing:** Just do the normal math first (5 × 3 = 15). Then look at the signs. Same rules: two negatives make a positive. One positive and one negative make a negative!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The BODMAS Gauntlet", 
        content: "Solve: **10 - 2 × (5 - 8)²**\n\n• **Step 1 (Brackets):** Solve (5 - 8). That's 5 hot vs 8 cold. Result is -3.\n   *Equation is now: 10 - 2 × (-3)²*\n• **Step 2 (Orders):** Solve the squared part. (-3)². A negative times a negative is positive. -3 × -3 = +9.\n   *Equation is now: 10 - 2 × 9*\n• **Step 3 (Multiply):** Solve 2 × 9. That is 18.\n   *Equation is now: 10 - 18*\n• **Step 4 (Subtract):** Solve 10 - 18. That's 10 hot vs 18 cold. Result is -8.\n\n**Final Answer: -8.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "A catastrophic mistake with BODMAS is thinking that Addition MUST come before Subtraction just because 'A' comes before 'S' in the acronym. **Addition and Subtraction have the EXACT SAME priority level.** When you reach them, you must just read the equation like a book, from left to right. \nExample: 10 - 4 + 2. If you do Addition first (4+2=6), you get 10 - 6 = 4. WRONG! Read left to right: 10 - 4 = 6. Then 6 + 2 = 8. The real answer is 8!" 
      }
    ]
  }
};

for (const [key, data] of Object.entries(batch3)) {
  const filePath = path.join(__dirname, 'learnContent', key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log('Batch 3 successfully written!');

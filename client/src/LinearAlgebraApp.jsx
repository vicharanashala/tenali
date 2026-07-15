import { useEffect, useState, useRef } from 'react'
import './LinearAlgebraApp.css'

const API = import.meta.env.VITE_API_BASE_URL || ''

function textMatches(input, keywords) {
  const t = (input || '').toLowerCase().trim()
  return keywords.some(k => t.includes(k.toLowerCase()))
}

const MODULES = [
  { id: 1, emoji: '\uD83D\uDCC8', title: 'Linear Relations', start: 1, end: 14 },
  { id: 2, emoji: '\uD83D\uDD10', title: 'Matrix Applications', start: 15, end: 21 },
  { id: 3, emoji: '\uD83C\uDF30', title: 'Spaces & Transformations', start: 22, end: 36 },
  { id: 4, emoji: '\uD83C\uDFC6', title: 'Fundamental Theorem', start: 37, end: 45 },
  { id: 5, emoji: '\uD83C\uDF93', title: 'Capstone Review', start: 46, end: 50 },
  { id: 6, emoji: '\uD83C\uDF10', title: 'Real-World Applications', start: 51, end: 56 },
];
const MISSIONS = [
  // Mission 1
  {
    id: 1, emoji: '\uD83D\uDCB0', title: 'Piggy Bank Detectives',
    story: "Ram's pocket money is twice Lakshman's. They save everything. Plot their weekly savings (R, L) and spot the pattern!",
    goal: 'Understand direct proportion - points lie on a line through the origin.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'Do the points (R, L) all lie on a straight line passing through the origin?',
    options: null,
    correct: 0,
    explanation: "Since Ram = 2 x Lakshman, points are (2L,L) = t(2,1). All scalar multiples lie on the same line through the origin!",
    ggbHint: 'Type coordinates like (10,20) and (20,40). Then type: Line((0,0),(10,20)).',
    ggbSteps: [
      'Click in the Input bar at bottom.',
      'Type: (10,20) and press Enter.',
      'Type: (20,40) and press Enter.',
      'Type: Line((0,0),(10,20)) and press Enter.',
      'Both points lie on same line through origin!'
    ],
    quiz: [
      { q: "If Ram's savings = 3x Lakshman's, do points (L,R) still lie on a line through the origin?", type: 'yesno', correct: 0 },
      { q: 'For points (2,1), (4,2), (6,3), is the ratio R:L always the same (2:1)?', type: 'yesno', correct: 0 },
      { q: 'Do all scalar multiples t(2,1) lie on the same line through the origin?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🚕', title: 'Taxi Fare', equation: 'Total = 12x + 25', story: 'A taxi charges a base fare of Rs25 just for getting in, plus Rs12 for every kilometre you travel. So for 1 km you pay Rs37, for 2 km you pay Rs49, and so on. The total fare grows linearly with distance.', question: 'What does the base fare of Rs25 represent on the graph — where does the line start when the distance is zero?', answer: '25' },
      { emoji: '📱', title: 'Phone Plan', equation: 'Total = 199 + 1x', story: 'Your phone plan costs Rs199 per month as a fixed rental, and then Rs1 for every minute you talk beyond the free minutes. If you talk for 10 minutes extra, you pay Rs209. The cost rises by Rs1 for each additional minute.', question: 'What is the rate of change — how much does the total bill increase for each extra minute you talk?', answer: '1' },
      { emoji: '🎬', title: 'Netflix', equation: 'Total = 149 + 50x', story: 'Netflix charges a base subscription of Rs149 per month, and then Rs50 for each additional screen you want to use simultaneously. If your family wants to watch on 2 screens at once, the total monthly cost goes up accordingly.', question: 'Using the pricing structure above, what would be the total monthly cost if your family wants to watch on 2 screens simultaneously?', answer: '249' },
      { emoji: '⛽', title: 'Fuel Cost', equation: 'Cost = 105x', story: 'Petrol costs Rs105 per litre. There is no fixed charge — you pay strictly for what you pump. If you buy 0 litres, you pay nothing. If you buy 3 litres, you pay Rs315. The line passes through the origin because there is no base cost.', question: 'Why does the cost line pass through the origin (0,0) in this scenario? What does that tell us about the pricing structure?', answer: 'no base cost' },
      { emoji: '📦', title: 'Shipping', equation: 'Total = 40 + 20x', story: 'An online store charges a flat Rs40 handling fee plus Rs20 per kilogram of weight for shipping. A 1 kg parcel costs Rs60, a 3 kg parcel costs Rs100. The heavier the package, the more you pay, on top of the fixed handling charge.', question: 'Based on the graph, what is the total shipping cost for a package weighing 3 kilograms?', answer: '100' },
      { emoji: '⚡', title: 'Electricity', equation: 'Total = 200 + 8x', story: 'Your electricity bill has two components: a fixed monthly charge of Rs200 regardless of how much electricity you use, plus Rs8 for every unit (kilowatt-hour) consumed. Even if you use zero units, you still owe Rs200.', question: 'What is the fixed monthly charge that you must pay even if you consume zero units of electricity?', answer: '200' },
      { emoji: '🌳', title: 'Tree Growth', equation: 'Height = 50 + 20x', story: 'A sapling is planted at a height of 50 cm. Each year it grows by 20 cm. After 1 year it is 70 cm tall, after 2 years it is 90 cm, and the growth continues at this steady rate. The starting height is the y-intercept.', question: 'Using the growth rate shown in the graph, what will be the tree\'s height after 5 years of growth?', answer: '150' },
      { emoji: '🎂', title: 'Bakery', equation: 'Total = 500 + 200x', story: 'A bakery charges Rs500 for a basic cake order (covering decoration and packaging) plus Rs200 per kilogram of cake. A 1 kg cake costs Rs700, a 2 kg cake costs Rs900. The relationship between weight and total cost is a straight line.', question: 'What type of mathematical function describes the relationship between cake weight and total cost — is it linear, quadratic, or something else?', answer: 'linear' },
      { emoji: '✈️', title: 'Flight', equation: 'Total = 2500 + 5x', story: 'A airline charges Rs2500 as a base ticket price plus Rs5 per kilometre of distance travelled. A short 100 km hop costs Rs3000, while a longer 200 km flight costs Rs3500. The longer the route, the higher the fare.', question: 'Looking at the graph, what flight distance would give a total fare of Rs3500? Trace from the y-value to the line and down to the x-axis.', answer: '200' },
    ],
    solveExplanation: 'Ram = 2xLakshman. Points are (2L,L)=L(2,1). Scalar multiples lie on a line through the origin.'
  },
  // Mission 2
  {
    id: 2, emoji: '\uD83D\uDDFA\uFE0F', title: 'Treasure Map',
    story: 'Atul at (0,0). Walk: right 2, up 1 (Bala). right 1, up 1 (Chetan). right 1, up 1 (Divya). Are B,C,D on a line?',
    goal: 'Plot consecutive points and check collinearity.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'Are Bala, Chetan and Divya collinear — do they lie on a single straight line?',
    options: null,
    correct: 0,
    explanation: 'B=(2,1), C=(3,2), D=(4,3). Slope=(2-1)/(3-2)=1. Eqn: y-1=1(x-2) so y=x-1. All collinear!',
    ggbHint: 'Plot points using coordinates. Then type: Line((2,1),(3,2)).',
    ggbSteps: [
      'Type: (0,0) - Atul house (A)',
      'From A: right 2, up 1 -> (2,1) = Bala',
      'From B: right 1, up 1 -> (3,2) = Chetan',
      'From C: right 1, up 1 -> (4,3) = Divya',
      'Type: Line((2,1),(3,2)). Does (4,3) lie on it?'
    ],
    quiz: [
      { q: 'What is slope of line containing B,C,D?', type: 'yesno', correct: 0 },
      { q: 'Is the equation of the line through B(2,1), C(3,2), D(4,3) given by y = x - 1?', type: 'yesno', correct: 0 },
      { q: 'Does the pattern (2,1), (3,2), (4,3) continue with (5,4)?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '📍', title: 'GPS Path', equation: '', story: 'Your phone\'s GPS records waypoints as you walk. If all the recorded points happen to lie on a single straight line, that means you were walking in a perfectly straight direction the whole time. GPS apps use this to detect whether you deviated from a straight path.', question: 'What does it mean for GPS waypoints to be collinear, and what does that tell us about the path you walked?', answer: 'on same line' },
      { emoji: '📐', title: 'Architecture', equation: '', story: 'When an architect designs a building, the centres of all supporting columns must line up perfectly in a straight row. If even one column is slightly off the line, the structural load distribution becomes uneven, which could cause serious problems.', question: 'Why is it critical for architects to verify that column centre points are collinear during building design?', answer: 'alignment' },
      { emoji: '🛤️', title: 'Railway Tracks', equation: '', story: 'Railway sleepers (the horizontal beams under the rails) must be perfectly collinear — lying along a straight line — for the train to travel smoothly. If the sleepers are misaligned, the rails will not be straight, and the train could derail.', question: 'What dangerous consequence could occur if railway sleepers are not collinear?', answer: 'derailment' },
    ],
    solveExplanation: 'B=(2,1), C=(3,2), D=(4,3). Slope=1. All satisfy y=x-1 -> collinear!'
  },
  // Mission 3
  {
    id: 3, emoji: '\uD83C\uDFAF', title: 'Darts at the Origin',
    story: 'Plot y=x, y=2x, y=10x. They all hit the bullseye (0,0)! Why?',
    goal: 'Why lines of form y=ax always pass through origin.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Why do all lines of form y = ax pass through the origin?',
    options: null,
    correct: null,
    expectedKeywords: ['origin', '(0,0)', 'zero', 'no constant', 'b=0', 'intercept is zero'],
    explanation: 'When x=0, y=a*0=0 for ANY a. So (0,0) is always on the line!',
    ggbHint: 'Type each equation. Look at y when x=0.',
    ggbSteps: [
      'Type: y = x and press Enter.',
      'Type: y = 2x and press Enter.',
      'Type: y = 10x and press Enter.',
      'Click on (0,0) - all 3 lines pass through it!',
      'Now type: y = -5x. Does it also pass through (0,0)?'
    ],
    quiz: [
      { q: 'Does y = -3x pass through the origin?', type: 'yesno', correct: 0 },
      { q: 'Does y = 0.5x + 0 pass through origin?', type: 'yesno', correct: 0 },
      { q: 'Does y = x + 1 pass through the origin?', type: 'yesno', correct: 1 }
    ],
    realLife: [
      { emoji: '💰', title: 'Simple Interest', equation: '', story: 'In simple interest, the interest earned equals the interest rate multiplied by the principal amount. If you deposit Rs0, you earn Rs0 interest. There is no starting amount of interest — it always begins at zero. This means the interest line always passes through the origin.', question: 'Why does the simple interest line always pass through the origin (0,0)?', answer: 'yes' },
      { emoji: '🛒', title: 'Unit Pricing', equation: '', story: 'When you buy items at a fixed price per unit, the total cost equals the price times the quantity. If you buy zero items, you pay nothing — the cost is zero. There is no fixed charge, so the cost line goes through the origin.', question: 'Why does the unit pricing line pass through the origin (0,0)?', answer: 'yes' },
      { emoji: '🏃', title: 'Distance', equation: '', story: 'Distance travelled equals speed multiplied by time. At time zero (the moment you start), you have covered zero distance. The starting point is the origin, and the slope of the distance-time graph represents your speed.', question: 'In a distance-time graph, what does the slope of the line represent in physical terms?', answer: 'speed' },
      { emoji: '💧', title: 'Water Flow', equation: '', story: 'Water flows out of a tank at a constant rate. The volume dispensed equals the flow rate multiplied by time. At time zero, the tank has dispensed nothing — the volume is zero. The line starts at the origin.', question: 'Why does the water flow volume line pass through the origin (0,0)?', answer: 'yes' },
    ],
    solveExplanation: 'When x=0, y=a(0)=0. So (0,0) satisfies the equation for any a. The origin is always on y=ax!'
  },
  // Mission 4
  {
    id: 4, emoji: '\uD83E\uDDF1', title: 'The Brick Wall',
    story: 'Plot y = 2x + 1. Try to make it pass through origin. Can you? Why not?',
    goal: 'Understand how the constant term shifts the line off the origin.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Why does y = 2x + 1 NOT pass through the origin?',
    options: null,
    correct: null,
    expectedKeywords: ['constant', 'intercept', 'b=1', 'b = 1', '+1', 'when x=0', 'y=1', 'y equals 1', 'shift', 'not zero'],
    explanation: 'When x=0, y = 2(0) + 1 = 1, not 0. So (0,0) is NOT on the line. The +1 shifts the line up by 1.',
    ggbHint: 'Type the equation. Then type (0,0) and see if the line passes through it.',
    ggbSteps: [
      'Type: y = 2x + 1 and press Enter.',
      'Type: (0,0) and press Enter - this is the origin.',
      'Does the line pass through (0,0)? No!',
      'Type: y = 2x and compare. What is different?',
      'The +1 shifts the whole line UP by 1 unit!'
    ],
    quiz: [
      { q: 'Does y = 2x + 1 give y = 1 when x = 0?', type: 'yesno', correct: 0 },
      { q: 'Does the line y = 2x + 1 cross the y-axis at (0,1)?', type: 'yesno', correct: 0 },
      { q: 'If we remove the +1, does y=2x pass through origin?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🚕', title: 'Taxi Fare', equation: 'Total = 12x + 25', story: 'A taxi charges a base fare of Rs25 plus Rs12 per km. When you have not travelled any distance (x=0), you still owe Rs25 — that is the base fare. The y-intercept of the graph shows this starting cost before any kilometres are covered.', question: 'On the graph, what does the y-intercept value of 25 represent in the context of this taxi fare scenario?', answer: '25' },
      { emoji: '📱', title: 'Phone Plan', equation: 'Total = 199 + 1x', story: 'Your phone plan costs Rs199 per month as a fixed rental fee, plus Rs1 per extra minute. Even if you do not make a single extra call (x=0), you still pay Rs199. The y-intercept on the graph shows this fixed monthly charge.', question: 'What is the y-intercept value on the graph, and what does it represent in this phone plan?', answer: '199' },
      { emoji: '⚡', title: 'Electricity', equation: 'Total = 200 + 8x', story: 'Your electricity bill has a fixed charge of Rs200 per month, plus Rs8 per unit consumed. Even if you use zero units of electricity, you still owe Rs200. The y-intercept represents this unavoidable fixed charge.', question: 'What is the y-intercept value on the graph, and what does it represent for this electricity bill?', answer: '200' },
      { emoji: '🌳', title: 'Tree Height', equation: 'Height = 50 + 20x', story: 'A sapling is planted at a height of 50 cm and grows 20 cm per year. At year zero (when it is first planted), the tree is already 50 cm tall. The y-intercept shows this initial height, which is why the line does not start at the origin.', question: 'Does this tree growth line pass through the origin? Why or why not?', answer: 'no' },
    ],
    solveExplanation: 'When x=0, y=2(0)+1=1. The constant term is the y-intercept - where the line meets the y-axis.'
  },
  // Mission 5
  {
    id: 5, emoji: '\uD83C\uDFAE', title: 'Game Controller',
    story: 'Create sliders for a and b. Watch the line y = ax + b dance as you drag!',
    goal: 'Explore how slope (a) and intercept (b) change the line visually.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'When you increase the slope parameter a, does the line y = ax + b become steeper?',
    options: null,
    correct: 0,
    explanation: 'The slope a controls steepness. Larger a = steeper line. The intercept b controls vertical position.',
    ggbHint: 'Create sliders for a and b, then type y = a*x + b.',
    ggbSteps: [
      'Click the Slider tool (look for it in toolbar).',
      'Create slider named a with min=-5, max=5, step=0.1',
      'Create slider named b with min=-5, max=5, step=0.1',
      'Type: y = a*x + b in the Input bar.',
      'Drag the sliders and watch the line!'
    ],
    quiz: [
      { q: 'Does slider a control the slope/steepness of the line?', type: 'yesno', correct: 0 },
      { q: 'Is the slope a equal to the tangent of the angle the line makes with the x-axis?', type: 'yesno', correct: 0 },
      { q: 'If you set a=0 and b=3, do you get a horizontal line at y=3?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏃', title: 'Running Speed', equation: '', story: 'When you go for a run, your distance from home can be modelled as a linear function. The slope of the line represents your running speed — a steeper line means you run faster. The y-intercept represents how far ahead you started from home (your initial position).', question: 'In a distance-time graph for a runner, what does the slope of the line physically represent?', answer: 'speed' },
      { emoji: '🏦', title: 'Savings', equation: '', story: 'Every week you save a fixed amount of money. Your total savings over time form a straight line. The slope shows how much you save each week, while the y-intercept shows how much money you already had saved before you started this weekly plan.', question: 'In a savings graph over time, what does the y-intercept value represent?', answer: 'initial savings' },
    ],
    solveExplanation: 'Slope a = steepness. Intercept b = where line crosses y-axis. Together they define every line!'
  },
  // Mission 6
  {
    id: 6, emoji: '\uD83E\uDD1D', title: 'Meeting Point',
    story: 'Plot 2x+3y=7 and 3x+4y=10. Where do they meet? This is our first MATRIX problem!',
    goal: 'Connect simultaneous equations to matrix form.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'Does the intersection point of two lines give the (x,y) that satisfies both equations simultaneously?',
    options: null,
    correct: 0,
    explanation: 'The intersection gives (x,y) that works for BOTH equations. This is exactly the matrix equation Ax=b!',
    ggbHint: 'Type both equations. Use Intersect tool to find where they cross.',
    ggbSteps: [
      'Type: 2x + 3y = 7 in Input bar and press Enter.',
      'Type: 3x + 4y = 10 and press Enter.',
      'Click the Intersect tool (two curves crossing icon).',
      'Click on line 1, then click on line 2.',
      'What point does GeoGebra show?'
    ],
    quiz: [
      { q: 'Can the system 2x+3y=7, 3x+4y=10 be written in matrix form Ax=b?', type: 'yesno', correct: 0 },
      { q: 'Does the solution to 2x+3y=7 and 3x+4y=10 satisfy both equations at the same time?', type: 'yesno', correct: 0 },
      { q: 'Can a system of 2 equations in 2 unknowns have more than one solution?', type: 'yesno', correct: 1 }
    ],
    realLife: [
      { emoji: '🚌', title: 'Supply-Demand', equation: 'p = 2q + 1, p = -3q + 20', story: 'In a market, the supply curve shows the price at which producers are willing to sell a certain quantity — the more they produce, the higher the price they need. The demand curve shows the price buyers are willing to pay — the more available a product, the less they are willing to pay. Where these two lines cross is the equilibrium point — the price and quantity where supply exactly meets demand.', question: 'What does the intersection point of the supply and demand curves represent in economic terms?', answer: 'equilibrium price' },
      { emoji: '🏢', title: 'Break-even', equation: 'C = 100 + 20x, R = 50x', story: 'A small business has fixed costs of Rs100 (rent, equipment) and variable costs of Rs20 per unit produced. Each unit is sold for Rs50. At first, costs exceed revenue and the business loses money. But as more units are sold, revenue catches up. The break-even point is where the cost line and revenue line intersect — the exact number of units where the business stops losing money and starts making profit.', question: 'How many units must be sold for the business to break even — that is, for revenue to exactly cover all costs?', answer: '3.33' },
      { emoji: '🏗️', title: 'Construction', equation: 'y = 2x + 1, y = -x + 4', story: 'An engineer is designing a support structure with two beams that cross each other. Beam 1 follows the line y = 2x + 1 and Beam 2 follows y = -x + 4. The point where they cross is critical — that is where a joint or bracket must be placed to connect them securely.', question: 'At what coordinates (x, y) do the two beams intersect, and where should the support bracket be placed?', answer: 'x=1,y=3' },
    ],
    solveExplanation: 'The matrix [[2,3],[3,4]] times vector [x,y] equals vector [7,10]. Intersection solves Ax=b!'
  },
  // Mission 7
  {
    id: 7, emoji: '\uD83D\uDD31', title: 'Time Machine',
    story: 'f(x)=3x+2. If f(a)=17, can you find a? Is it unique? Can you REVERSE any function?',
    goal: 'Understand invertible functions - one input gives one output, and vice versa.',
    ggbType: 'graphing',
    answerType: 'num',
    prompt: 'Find \u03b1 such that f(\u03b1) = 17 for f(x)=3x+2',
    correct: 5,
    tolerance: 0,
    explanation: '3a+2=17 -> 3a=15 -> a=5. Unique! f is invertible because it is one-to-one.',
    ggbHint: 'Type f(x)=3x+2. Then type f(5). Try changing the input.',
    ggbSteps: [
      'Type: f(x) = 3x + 2 and press Enter.',
      'Type: f(5) and press Enter. See what GeoGebra gives.',
      'Now try: Solve(3x+2=17) and press Enter.',
      'GeoGebra shows x=5. That is the unique answer!'
    ],
    quiz: [
      { q: 'Is f(x)=3x+2 invertible because each x gives a unique y?', type: 'yesno', correct: 0 },
      { q: 'Is the inverse of f(x)=3x+2 given by f⁻¹(y)=(y-2)/3?', type: 'yesno', correct: 0 },
      { q: 'For a function to be invertible, must it be one-to-one (injective)?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '📈', title: 'Temperature', equation: 'F = 1.8C + 32', story: 'Converting between Celsius and Fahrenheit uses a linear function. The formula F = 1.8C + 32 tells you the Fahrenheit temperature for any Celsius value. The inverse function — going from Fahrenheit back to Celsius — reverses this calculation: C = (F - 32) / 1.8. Being able to invert a function means you can go both directions.', question: 'When you use the inverse of the Celsius-to-Fahrenheit formula, what physical quantity do you get back?', answer: 'Celsius' },
      { emoji: '💰', title: 'Currency', equation: 'INR = 83 * USD', story: 'Converting US dollars to Indian rupees is a simple multiplication: multiply by 83. But what if you have rupees and want to know how many dollars that is? You need the inverse function — divide by 83. The inverse lets you reverse the conversion direction.', question: 'What does the inverse of the currency conversion function allow you to do?', answer: 'reverse conversion' },
      { emoji: '🏠', title: 'Tax Calculation', equation: 'T = 0.3 * Income', story: 'If the tax rate is 30%, your tax equals 0.3 times your income. But what if you know the tax you paid and want to figure out your original income? You need the inverse function: Income = Tax / 0.3. The inverse reverses the calculation.', question: 'What does the inverse of the tax function give you?', answer: 'Income = T/0.3' },
    ],
    solveExplanation: '3a+2=17 -> 3a=15 -> a=5. Each x has exactly one y (and vice versa) => invertible!'
  },
  // Mission 8
  {
    id: 8, emoji: '\uD83C\uDFA2', title: 'Parabola Slide',
    story: 'f(x)=x\u00b2-10. What is f(5)? Slide along the parabola and find out!',
    goal: 'Evaluate a function by tracing along its curve in GeoGebra.',
    ggbType: 'graphing',
    answerType: 'num',
    prompt: 'f(x) = x\u00b2 - 10. What is f(5)?',
    correct: 15,
    tolerance: 0,
    explanation: 'f(5) = 5\u00b2 - 10 = 25 - 10 = 15. The point (5,15) lies on the parabola.',
    ggbHint: 'Type f(x)=x^2-10. Then type f(5). Trace along the curve!',
    ggbSteps: [
      'Type: f(x) = x^2 - 10 and press Enter.',
      'Type: (5, f(5)) and press Enter.',
      'GeoGebra plots the point (5,15)!',
      'Click and drag on the curve - watch y change as x moves.'
    ],
    quiz: [
      { q: 'Is f(x)=x²-10 invertible over all real numbers?', type: 'yesno', correct: 1 },
      { q: 'Can a parabola like y=x² be inverted globally (over all reals)?', type: 'yesno', correct: 1 },
      { q: 'If f(a)=f(b) for two different inputs a and b, is f one-to-one (invertible)?', type: 'yesno', correct: 1 }
    ],
    realLife: [
      { emoji: '🎮', title: 'Projectile', equation: 'h(t) = -5t² + 20t', story: 'When you throw a ball straight up, its height over time follows a parabolic path — it rises, reaches a peak, then falls back down. The function h(t) = -5t² + 20t models this. At time t=2 seconds, you can substitute into the formula to find exactly how high the ball is at that moment.', question: 'Using the projectile motion formula, what is the height of the ball at time t = 2 seconds?', answer: '20' },
      { emoji: '🎯', title: 'Profit Curve', equation: 'P(x) = -x² + 100x', story: 'A company\'s profit depends on how many units it produces and sells. At first, profit increases with more units — but eventually, costs like storage and marketing start eating into gains. The profit function P(x) = -x² + 100x is a downward parabola showing this trade-off. At x=30 units, the profit reaches a specific value.', question: 'What is the profit when the company produces and sells 30 units?', answer: '2100' },
      { emoji: '🌊', title: 'Tide Height', equation: 'h(t) = 2sin(t) + 5', story: 'Ocean tides rise and fall in a periodic, wave-like pattern that can be modelled using trigonometric functions. The tide height h(t) = 2sin(t) + 5 oscillates between 3 metres (low tide) and 7 metres (high tide), with an average water level of 5 metres. At hour 3, you can compute the exact tide height.', question: 'What type of mathematical function is used to model the tide — is it linear, quadratic, or trigonometric?', answer: 'trigonometric' },
    ],
    solveExplanation: 'f(5) = 25 - 10 = 15. The point (5,15) is on the parabola. Simple substitution!'
  },
  // Mission 9
  {
    id: 9, emoji: '\uD83C\uDFAF', title: 'Hit the Target',
    story: 'f(x)=x\u00b2-10. f(a)=54. Find a. Can there be TWO answers?',
    goal: 'Discover that inverse of parabola is not a function - two inputs give same output.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Find value(s) of a such that f(a) = 54 for f(x)=x\u00b2-10',
    expectedKeywords: ['8', '-8', '\u00b18', 'plus minus 8', '\u00B1', '8 and -8', 'two'],
    explanation: 'a\u00b2 - 10 = 54 -> a\u00b2 = 64 -> a = 8 or a = -8. TWO values! Not invertible.',
    ggbHint: 'Type: Solve(x^2 - 10 = 54). GeoGebra shows two solutions!',
    ggbSteps: [
      'Type: f(x) = x^2 - 10 and press Enter.',
      'Type: y = 54 and press Enter (horizontal line).',
      'Find intersection of f(x) and y=54 using Intersect tool.',
      'How many intersection points? TWO! Both are answers.'
    ],
    quiz: [
      { q: 'Can a quadratic equation have two distinct real solutions?', type: 'yesno', correct: 0 },
      { q: 'Does the parabola y=x²-10 intersect y=54 at two symmetric points?', type: 'yesno', correct: 0 },
      { q: 'If f(a)=f(-a) for all a, is f an even function?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '📡', title: 'Signal Strength', equation: '', story: 'A radio signal\'s strength depends on distance from the transmitter following a quadratic pattern: Signal = d² - 10. Because of the squared term, two different distances (one closer, one farther) can produce the exact same signal strength. This means there are two positions where you receive the same signal quality.', question: 'Why can two different positions give the same signal strength in this quadratic model?', answer: 'symmetric' },
      { emoji: '🏆', title: 'Projectile Height', equation: '', story: 'When you throw a ball into the air, it reaches any given height twice — once on the way up and once on the way down. The parabola is symmetric, so the same y-value appears at two different x-values (times). This is why quadratic equations can have two solutions.', question: 'When a projectile reaches the same height twice, what does having two solutions tell us about the ball\'s motion?', answer: 'going up and down' },
    ],
    solveExplanation: 'a\u00b2 = 64 -> a = 8 or a = -8. The parabola is symmetric, so two x give same y.'
  },
  // Mission 10
  {
     id: 10, emoji: '\uD83C\uDFAA', title: 'Roller Coaster',
    story: 'g(x) = x\u00b3 - x\u00b2 - 14x + 2. If g(x) = -22, find x. A cubic can be wild!',
    goal: 'Solve a cubic equation - multiple solutions possible.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Solve g(x) = -22 for g(x) = x\u00b3 - x\u00b2 - 14x + 2',
    expectedKeywords: ['-4', '2', '3', 'three solutions', '-4, 2, 3'],
    explanation: 'x\u00b3 - x\u00b2 - 14x + 2 = -22 -> x\u00b3 - x\u00b2 - 14x + 24 = 0 -> (x+4)(x-2)(x-3) = 0. So x = -4, 2, or 3',
    ggbHint: 'Type: Solve(x^3 - x^2 - 14x + 2 = -22). How many solutions? Three!',
    ggbSteps: [
      'Type: g(x) = x^3 - x^2 - 14x + 2 and press Enter.',
      'Type: y = -22 and press Enter (horizontal line).',
      'Use Intersect tool to find where g(x) and y=-22 meet.',
      'Count the intersections! Three points: x = -4, 2, and 3.'
    ],
    quiz: [
      { q: 'Can a cubic equation have more real solutions than a quadratic equation?', type: 'yesno', correct: 0 },
      { q: 'Can a degree-n polynomial have more than n real roots?', type: 'yesno', correct: 1 },
    ],
    realLife: [
      { emoji: '🎮', title: 'Video Game Physics', equation: '', story: 'In many video games, a character\'s jump height follows a cubic path — they accelerate, decelerate, and may even bounce. Because a cubic function can wiggle up and down, the character might reach the same height at three different moments during the jump — going up, coming down, and bouncing back up again.', question: 'How many different times can a character be at the same height during a cubic jump path?', answer: 'up to 3' },
      { emoji: '📊', title: 'Stock Market', equation: '', story: 'Stock prices sometimes follow complex patterns that can be modelled by cubic functions. A cubic curve can rise, fall, and rise again — meaning the stock price could be at the same value on three different trading days. This is why cubic equations can have three solutions.', question: 'Why might a cubic stock price model give multiple solutions for when the price equals a certain value?', answer: 'cubic shape' },
    ],
    solveExplanation: 'Cubic can have up to 3 real solutions. g(x) = -22 gives x = -4, 2, or 3.'
  },
  // Mission 11
  {
    id: 11, emoji: '\uD83D\uDE80', title: 'Dimensional Portal',
    story: 'What are R, R\u00b2, and R\u00b3? A point lives in different dimensions!',
    goal: 'Understand dimensional spaces - 1D line, 2D plane, 3D space.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'Does a point in R² require exactly 2 coordinates to specify its position?',
    options: null,
    correct: 0,
    explanation: 'R = 1D number line (one coordinate). R\u00b2 = 2D plane (two coordinates). R\u00b3 = 3D space (three coordinates).',
    ggbHint: 'Plot a point in 2D (R\u00b2) with (x,y). GeoGebra shows both axes.',
    ggbSteps: [
      'Type: (2,3) and press Enter - a point in R\u00b2.',
      'Type: (0,0) - the origin in R\u00b2.',
      'Notice you need TWO numbers to describe any location.',
      'In R (1D), you would need ONE number. In R\u00b3, THREE numbers!'
    ],
    quiz: [
      { q: 'How many coordinates does a point in R³ need?', type: 'yesno', correct: 0 },
      { q: 'Is R² the standard notation for the 2D real coordinate plane?', type: 'yesno', correct: 0 },
      { q: 'Does a data point with 5 independent measurements live in R⁵?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🌍', title: 'GPS Coordinates', equation: '', story: 'Your position on Earth\'s surface is described by two numbers: latitude and longitude. These two coordinates form a point in a 2-dimensional space (R²). Just like you need an (x,y) pair to locate a point on a flat map, you need exactly two numbers to pinpoint any location on the globe.', question: 'What mathematical space do latitude and longitude together define?', answer: 'R²' },
      { emoji: '📱', title: 'Phone Location', equation: '', story: 'Your phone tracks not just your latitude and longitude, but also your altitude above sea level. Now you need three numbers to describe your exact position — this is a point in 3-dimensional space (R³). The third coordinate adds the height dimension.', question: 'When your phone tracks latitude, longitude, and altitude, what is the third coordinate that makes it 3D?', answer: 'altitude' },
      { emoji: '🎵', title: 'Sound Waves', equation: '', story: 'A sound wave can be described by three key properties: its frequency (how high or low the pitch is), its amplitude (how loud it is), and time (when it occurs). These three values together form a point in a 3-dimensional space, allowing us to analyse and process sound mathematically.', question: 'How many dimensions are needed to describe a sound wave using frequency, amplitude, and time?', answer: '3' },
    ],
    solveExplanation: 'R = 1D, R\u00b2 = 2D, R\u00b3 = 3D. Higher dimensions = more coordinates to describe position!'
  },
  // Mission 12
  {
    id: 12, emoji: '\uD83C\uDF00', title: 'Transformation Machine',
    story: '\u03c6(x,y) = (2x+3y, 3x+4y). This IS a matrix! Write it as a 2x2 matrix.',
    goal: 'See a function as a matrix transformation.',
    ggbType: 'geometry',
    answerType: 'text',
    prompt: 'Write the 2×2 matrix that represents φ(x,y) = (2x+3y, 3x+4y)',
    options: null,
    correct: null,
    expectedKeywords: ['[[2,3],[3,4]]', '[2,3]', '2 3 3 4', '2,3,3,4'],
    explanation: '\u03c6(x,y) = (2x+3y, 3x+4y). The coefficient matrix is [[2,3],[3,4]]. First row gives x\u2019, second gives y\u2019.',
    ggbHint: 'Plot a vector, then apply the transformation. GeoGebra can do matrix multiplication!',
    ggbSteps: [
      'Type: M = {{2,3},{3,4}} and press Enter.',
      'Type: v = (1,2) and press Enter.',
      'Type: M*v and press Enter.',
      'GeoGebra shows the transformed vector!'
    ],
    quiz: [
      { q: 'If φ(1,0) = (2,3), is (2,3) the first column of the matrix?', type: 'yesno', correct: 0 },
      { q: 'Does φ(0,1) give the second column of the transformation matrix?', type: 'yesno', correct: 0 },
      { q: 'Can matrix multiplication be used to compose (combine) two linear transformations?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '🖥️', title: 'Image Processing', equation: '', story: 'Every pixel in a digital image has three colour values: red, green, and blue (RGB). When you apply a filter — like making an image warmer or converting to black-and-white — each pixel\'s RGB triplet is multiplied by a matrix. The matrix transforms the original colours into new colours, creating the filtered effect.', question: 'What does the filter matrix do to each pixel\'s RGB colour values in image processing?', answer: 'transforms colors' },
      { emoji: '🎨', title: 'Computer Graphics', equation: '', story: 'When you rotate, scale, or skew a shape on screen, the computer uses matrix multiplication to transform every point. A 2×2 matrix can rotate a shape by any angle, stretch it along an axis, or shear it into a parallelogram. Matrix transformations are the foundation of all computer graphics.', question: 'What common transformation does a matrix perform on objects in computer graphics?', answer: 'rotate' },
      { emoji: '🤖', title: 'AI/ML', equation: '', story: 'A neural network processes information through layers, and each layer is essentially a matrix multiplication followed by a non-linear function. When an AI recognises a cat in a photo, it is passing the image through dozens of matrix transformations, each one extracting more abstract features from the previous layer.', question: 'In a neural network, what mathematical operation does each layer essentially perform?', answer: 'matrix transforms' },
    ],
    solveExplanation: '\u03c6(x,y) = (2x+3y, 3x+4y). First row coefficients: [2,3]. Second row: [3,4]. Matrix = [[2,3],[3,4]]!'
  },
  // Mission 13
  {
    id: 13, emoji: '\uD83E\uDDE9', title: 'Jigsaw Puzzle',
    story: 'Can you REVERSE the transformation? If \u03c6(x,y) = (2x+3y, 3x+4y), can you always find (x,y) from the output?',
    goal: 'Check if a matrix is invertible by checking if its determinant is non-zero.',
    ggbType: 'geometry',
    answerType: 'yesno',
    prompt: 'Since det([[2,3],[3,4]]) = -1 ≠ 0, is this matrix invertible?',
    options: null,
    correct: 0,
    explanation: 'det = 2*4 - 3*3 = 8 - 9 = -1. Non-zero determinant means the matrix is invertible!',
    ggbHint: 'Compute the determinant in GeoGebra. Then try to invert the matrix.',
    ggbSteps: [
      'Type: M = {{2,3},{3,4}} and press Enter.',
      'Type: Determinant(M) and press Enter. Result = -1',
      'Type: M^(-1) and press Enter. This is the inverse!',
      'A non-zero determinant means you can reverse the transformation.'
    ],
    quiz: [
      { q: 'Is det([[1,2],[2,4]]) equal to zero?', type: 'yesno', correct: 0 },
      { q: 'Does a zero determinant always mean a matrix is not invertible?', type: 'yesno', correct: 0 },
      { q: 'If det(A)≠0, does Ax=b always have a unique solution?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏆', title: 'Robotics', equation: '', story: 'A robot arm needs to reach a specific position in space. The forward problem is: given the joint angles, where does the end of the arm end up? The inverse problem is harder but essential — given the desired position, what joint angles achieve it? This requires the matrix to be invertible so the transformation can be reversed.', question: 'What does the inverse of the robot arm\'s transformation matrix give you?', answer: 'joint angles' },
      { emoji: '📊', title: 'Data Analysis', equation: '', story: 'Principal Component Analysis (PCA) compresses high-dimensional data by projecting it onto fewer dimensions. The key insight is that this compression is reversible — you can reconstruct the original data from the compressed version because the transformation matrix is invertible. Without invertibility, you would permanently lose information.', question: 'What property of the transformation matrix is essential for being able to reconstruct compressed data?', answer: 'invertibility' },
    ],
    solveExplanation: 'det = ad - bc = 2*4 - 3*3 = -1. Non-zero => invertible. A\u207b\u00b9 exists!'
  },
  // Mission 14
  {
    id: 14, emoji: '\uD83D\uDC7B', title: 'The Vanishing Act',
    story: 'Matrix [[1,2],[2,4]] has determinant ZERO. Which vectors VANISH (map to origin)?',
    goal: 'Find the null space / kernel of a non-invertible matrix.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Find a non-zero vector (x,y) such that [[1,2],[2,4]]*(x,y) = (0,0)',
    expectedKeywords: ['2,-1', '2, -1', '(2,-1)', '(2, -1)', '(-2,1)', '(-2, 1)', 'x=-2y', 'x=2y', 't(2,-1)'],
    explanation: 'x+2y=0 and 2x+4y=0. Both say x=-2y. So (x,y) = t*(-2,1). All vectors on this line map to origin!',
    ggbHint: 'Type M={{1,2},{2,4}}. Det(M) is 0. Find v such that M*v=(0,0).',
    ggbSteps: [
      'Type: M = {{1,2},{2,4}} and press Enter.',
      'Type: Determinant(M) - it is ZERO!',
      'Type: v = (2, -1) and press Enter.',
      'Type: M*v and press Enter. Result: (0,0)!',
      'These vectors form the KERNEL or NULL SPACE.'
    ],
    quiz: [
      { q: 'Does det(A)=0 mean the matrix is singular (not invertible)?', type: 'yesno', correct: 0 },
      { q: 'Is the set of vectors mapping to the origin called the null space (kernel)?', type: 'yesno', correct: 0 },
      { q: 'Can a singular matrix map infinitely many vectors to the origin?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '📷', title: 'Image Blur', equation: '', story: 'When you blur a photo, some fine details are permanently lost. Mathematically, blurring is like applying a singular matrix to the image — the matrix has determinant zero, meaning certain information (the null space) is destroyed. No amount of processing can perfectly recover the original sharp image because the data has been irreversibly compressed.', question: 'Can you perfectly restore a blurred image back to its original sharp version? Why or why not?', answer: 'no - info lost' },
      { emoji: '🔊', title: 'Audio Compression', equation: '', story: 'When you compress an audio file into MP3 format, some sounds are discarded to reduce file size. This is like a singular matrix transformation — certain frequency components (those in the null space) vanish entirely. The compressed file sounds almost the same, but the discarded information cannot be perfectly recovered.', question: 'In audio compression, what mathematical concept represents the sounds that are permanently discarded?', answer: 'null space info' },
      { emoji: '📦', title: 'Network Routing', equation: '', story: 'In a traffic network, certain flow patterns can cancel each other out at a junction — vehicles going in one direction are exactly balanced by vehicles going the other way, resulting in zero net traffic at that node. These cancelling patterns form the kernel (null space) of the network\'s routing matrix.', question: 'In a traffic network, what does the kernel (null space) of the routing matrix represent?', answer: 'vanishing flows' },
    ],
    solveExplanation: 'det=0 -> singular. [[1,2],[2,4]]*(x,y)=(0,0) -> x+2y=0 -> x=-2y. Line of vectors map to origin!'
  },
  // Mission 15
  {
    id: 15, emoji: '\uD83D\uDD10', title: 'Hill Cipher',
    story: "A=0, B=1, ..., Z=25. SUDARSHANA = 18,20,3,0,17,18,7,0,13,0. Encrypt with matrix [[2,3],[3,4]] → pairs (18,20)→(96,134), (3,0)→(6,9), (17,18)→(88,123). Decrypt using the inverse matrix!",
    goal: 'Use matrix multiplication and inverses for encryption/decryption.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What matrix operation is used to decrypt ciphertext pairs back to the original message in Hill Cipher?',
    options: null,
    correct: null,
    expectedKeywords: ['inverse', 'matrix', 'multiply', 'multiplication', 'invert'],
    explanation: 'Decryption = multiply each ciphertext pair by the inverse matrix. The inverse of [[2,3],[3,4]] is [[4,-3],[-3,2]] (mod 26 arithmetic).',
    ggbHint: 'Type M={{2,3},{3,4}}. Multiply M*{{18},{20}} to get the first encrypted pair. Find inverse with Invert[M].',
    ggbSteps: [
      'Type: M = {{2,3},{3,4}} and press Enter.',
      'Type: M * {{18},{20}} and press Enter → (96,134).',
      'Type: M * {{3},{0}} → (6,9). Continue for all pairs.',
      'Type: Invert[M] to get the decryption key.',
      'Multiply inverse by each encrypted pair to recover letters!'
    ],
    quiz: [
      { q: 'Does encrypting (S,U)=(18,20) with [[2,3],[3,4]] give 96 as the first component?', type: 'yesno', correct: 0 },
      { q: 'Does the encryption matrix need to be invertible for decryption to work?', type: 'yesno', correct: 0 },
      { q: 'Is modular arithmetic necessary in Hill Cipher to keep results in the alphabet range?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '📱', title: 'Messaging Apps', equation: '', story: 'When you send a message on WhatsApp, the text is encrypted before transmission so that no one intercepting the data can read it. The encryption uses matrix multiplication — your message letters are converted to numbers, multiplied by a secret matrix, and the result is sent over the network. Only the recipient with the inverse matrix can decrypt it back.', question: 'What matrix operation is used to encrypt your messages in secure messaging apps?', answer: 'matrix multiplication' },
      { emoji: '🌐', title: 'Online Banking', equation: '', story: 'When you transfer money online, your transaction details (amount, account numbers, timestamp) are encrypted using linear transformations before being sent. Each row of the encrypted output is a linear combination of the original data, making it unreadable to anyone without the decryption key.', question: 'In encrypted banking transactions, what does each row of the encrypted output matrix represent?', answer: 'encrypted output' },
      { emoji: '🕵️', title: 'Military Comms', equation: '', story: 'The Hill Cipher was one of the first practical encryption methods, used for secure battlefield communication in World War II. It works by grouping letters into vectors and multiplying them by a secret matrix. The receiver decrypts by multiplying with the inverse matrix. Without knowing the matrix, breaking the code is extremely difficult.', question: 'Why is the inverse matrix essential for decrypting a Hill Cipher message?', answer: 'to decrypt' },
    ],
    solveExplanation: 'M={{2,3},{3,4}}. Encrypt: M * [letter pair]. Decrypt: M_inverse * [encrypted pair]. Must be invertible!'
  },
  // Mission 16
  {
    id: 16, emoji: '\u2615', title: "Baker's Cafe",
    story: 'Table1: 3 adults + 1 child = \u20B91200. Table2: 1 adult + 2 children = \u20B91000. Can you find cost per adult (A) and child (C)? Then try: 3A+1C=1200, 1A+2C=1000, 1A+1C=900 — overdetermined! No exact solution — just minimize error.',
    goal: 'Solve systems with more equations than unknowns (least squares idea).',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'When you have 3 equations but only 2 unknowns, can you always find an exact solution that satisfies all three?',
    options: null,
    correct: 1,
    explanation: '3 equations, 2 unknowns = overdetermined. The extra equation may conflict. No exact (A,C) satisfies all three. Can only minimize error (least squares).',
    ggbHint: 'Plot all three lines. Do they intersect at one point? Type: Solve({3A+1C=1200,1A+2C=1000,1A+1C=900},{A,C})',
    ggbSteps: [
      'Type: 3x + y = 1200 and press Enter.',
      'Type: x + 2y = 1000 and press Enter.',
      'Type: x + y = 900 and press Enter.',
      'Observe — no single intersection for all three!',
      'The system has NO exact solution.'
    ],
    quiz: [
      { q: 'Is the solution to 3A+1C=1200 and 1A+2C=1000 given by A=280?', type: 'yesno', correct: 0 },
      { q: 'Is a system with more equations than unknowns called overdetermined?', type: 'yesno', correct: 0 },
      { q: 'Does the least squares method find the best approximate solution when no exact solution exists?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '📈', title: 'Business Forecasting', equation: '', story: 'A company collects sales data from many past months (lots of data points) but wants to fit a simple trend line with just two parameters (slope and intercept). This creates an overdetermined system — more equations than unknowns. No single trend line passes through all the data points, so the best approach is to minimise the total error using least squares.', question: 'When you have many data points but only a few parameters to estimate, what type of system do you get?', answer: 'overdetermined' },
      { emoji: '📱', title: 'GPS Positioning', equation: '', story: 'Your phone determines your location using signals from at least 4 satellites. But your position has only 3 coordinates (latitude, longitude, altitude). With 4+ satellite signals for 3 unknowns, the system is overdetermined. The extra signals are not wasted — they reduce定位error and improve accuracy through least squares estimation.', question: 'Why does GPS use more satellite signals than the minimum needed for a 3D position?', answer: 'reduce error' },
      { emoji: '🏥', title: 'Medical Imaging', equation: '', story: 'A CT scanner takes hundreds of X-ray measurements from different angles around your body. Each measurement is one equation, but the image has millions of pixels to reconstruct. This massively overdetermined system is solved using least squares to produce the sharpest possible image from the available measurements.', question: 'What mathematical technique is used to find the best image when you have far more measurements than unknowns?', answer: 'least squares' },
    ],
    solveExplanation: '3A+1C=1200, 1A+2C=1000 ⇒ A=280, C=360. Adding 1A+1C=900 gives conflict — no exact solution. Overdetermined systems minimize error instead.'
  },
  // Mission 17
  {
    id: 17, emoji: '\uD83D\uDD04', title: 'Markov Chain',
    story: 'City (C) and Suburb (S): each year 90% stay in C, 10% move to S; 80% stay in S, 20% move to C. From 1000 people in City, what is long-run distribution? Keep multiplying by transition matrix [[0.9,0.2],[0.1,0.8]]!',
    goal: 'Model state transitions using matrices and find steady state.',
    ggbType: 'graphing',
    answerType: 'num',
    prompt: 'After many years, what fraction of people end up in the City?',
    correct: 0.667,
    tolerance: 0.01,
    explanation: 'Steady state: M*v = v. Solve [[0.9,0.2],[0.1,0.8]]*[c,s]=[c,s] with c+s=1. City stabilizes at 2/3 ≈ 66.7%, Suburb at 1/3 ≈ 33.3%.',
    ggbHint: 'Type: M={{0.9,0.2},{0.1,0.8}}. Multiply M*{1000,0} repeatedly. Watch the values converge!',
    ggbSteps: [
      'Type: M = {{0.9,0.2},{0.1,0.8}}.',
      'Type: {1000, 0} for starting in City.',
      'Type: M * {1000, 0} → {900, 100} after year 1.',
      'Keep multiplying: M*ans each time.',
      'Values converge to ~667 City, ~333 Suburb!'
    ],
    quiz: [
      { q: 'Is the steady state City fraction approximately 2/3 (66.7%)?', type: 'yesno', correct: 0 },
      { q: 'Is the steady state defined by the matrix equation Mv = v?', type: 'yesno', correct: 0 },
      { q: 'Does every Markov chain reach a steady state?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏙️', title: 'Urban Planning', equation: '', story: 'City planners study how populations shift between urban and suburban areas over time. Each year, a certain percentage of city dwellers move to the suburbs and vice versa. By modelling these transitions as a matrix and multiplying it repeatedly, planners can predict the long-run population distribution — the steady state where the proportions stabilise.', question: 'When you repeatedly apply a transition matrix to population data, what does the final stable distribution represent?', answer: 'steady state' },
      { emoji: '📈', title: 'Stock Market', equation: '', story: 'Financial analysts model the stock market as switching between two states: a bull market (prices rising) and a bear market (prices falling). The transition probabilities between these states form a Markov chain. By raising the transition matrix to higher powers, analysts predict the long-run probability of being in a bull or bear market.', question: 'In a stock market Markov model, what does the steady-state vector represent?', answer: 'long-term probability' },
      { emoji: '🧬', title: 'Genetics', equation: '', story: 'Gene frequencies in a population change across generations due to mutation, selection, and genetic drift. These changes can be modelled as a Markov chain where each generation\'s gene distribution is obtained by multiplying the current distribution by a transition matrix. Over many generations, the gene frequencies settle into a steady state.', question: 'In population genetics, what does the transition matrix of a Markov chain represent?', answer: 'mutation rates' },
    ],
    solveExplanation: 'M = [[0.9,0.2],[0.1,0.8]]. Repeated multiplication converges to eigenvector with eigenvalue 1: City ~ 66.7%, Suburb ~ 33.3%.'
  },
  // Mission 18
  {
    id: 18, emoji: '\uD83E\uDD14', title: 'Guess the Solution',
    story: "Matrix form of overdetermined system: [[3,1],[1,2],[1,1]] * [A,C] = [1200,1000,900]. Can you guess A and C that come close? Try A=280, C=360 — error in 3rd equation is 280+360=640 ≠ 900. Keep guessing to minimize the total error!",
    goal: 'Understand overdetermined systems — more equations than unknowns, no exact solution.',
    ggbType: 'graphing',
    answerType: 'num',
    prompt: 'For A=280, C=360, what is 1A+1C? (The error vs 900)',
    correct: 640,
    tolerance: 1,
    explanation: '1A+1C = 280+360 = 640, but the third equation says it should be 900. Error = 260. With 3 equations and 2 unknowns, no (A,C) satisfies all three exactly.',
    ggbHint: 'Type: 3x+y=1200, x+2y=1000, x+y=900. No single intersection! Try {{3,1},{1,2},{1,1}}*{{280},{360}} in CAS.',
    ggbSteps: [
      'Type: 3x + y = 1200 and press Enter.',
      'Type: x + 2y = 1000 and press Enter.',
      'Type: x + y = 900 and press Enter.',
      'See how all three do NOT meet at one point.',
      'Try different (x,y) values — you can only minimize error!'
    ],
    quiz: [
      { q: 'Does the matrix [[3,1],[1,2],[1,1]] have 3 rows?', type: 'yesno', correct: 0 },
      { q: 'Can 3 equations with 2 unknowns have an exact solution?', type: 'yesno', correct: 1 },
      { q: 'Is a system with more equations than unknowns called overdetermined?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '📊', title: 'Weather Prediction', equation: '', story: 'Meteorologists collect thousands of temperature, pressure, and humidity measurements to estimate just a few weather parameters for their forecast model. With far more measurements than parameters, the system is overdetermined. No single set of parameters perfectly fits all the data, so they use least squares to find the best compromise.', question: 'When thousands of weather measurements are used to estimate a few forecast parameters, what type of system results?', answer: 'overdetermined' },
      { emoji: '📷', title: 'Photo Enhancement', equation: '', story: 'When you apply a filter to enhance a photo, millions of pixels are adjusted using just a handful of filter parameters. The filter must find the best settings that improve the overall image — this is an overdetermined problem because one set of parameters must satisfy the needs of millions of pixels simultaneously.', question: 'What mathematical technique finds the optimal filter settings when millions of pixels must be adjusted by a few parameters?', answer: 'least squares' },
      { emoji: '🏀', title: 'Sports Analytics', equation: '', story: 'A sports analyst collects performance statistics from dozens of games to estimate a player\'s true skill rating. Each game provides one equation, but the skill rating is a single number. With many equations for one unknown, the system is overdetermined — the analyst uses least squares to find the skill estimate that best fits all the game data.', question: 'When multiple game statistics are used to estimate a single skill rating, can all the data fit exactly?', answer: 'no overdetermined' },
    ],
    solveExplanation: '3 equations, 2 unknowns → overdetermined. No exact (A,C) works for all three. 1A+1C = 640 ≠ 900. Minimize error instead.'
  },
  // Mission 19
  {
    id: 19, emoji: '\uD83E\uDDE9', title: 'Why No Solution?',
    story: "Three lines: 3A+1C=1200, 1A+2C=1000, 1A+1C=900. In a plane, two lines intersect at one point. A third line may not pass through that point. Each equation is a constraint — too many constraints, no perfect fit! Matrix: [[3,1],[1,2],[1,1]]*[A,C] = [1200,1000,900].",
    goal: 'See geometrically why overdetermined linear systems have no exact solution.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'Can three lines in a plane always be made to intersect at a single common point?',
    options: null,
    correct: 1,
    explanation: 'Two lines intersect at exactly one point (unless parallel). A third random line almost never passes through that same point. So 3 equations in 2 unknowns are usually inconsistent — no solution exists.',
    ggbHint: 'Plot all three lines. The first two cross at one point. Does the third pass through it?',
    ggbSteps: [
      'Type: 3x + y = 1200.',
      'Type: x + 2y = 1000.',
      'Find their intersection.',
      'Type: x + y = 900.',
      'Does the third line pass through the intersection? No!'
    ],
    quiz: [
      { q: 'Do two non-parallel lines in a plane always intersect at exactly one point?', type: 'yesno', correct: 0 },
      { q: 'Is a third random line unlikely to pass through the intersection of the first two?', type: 'yesno', correct: 0 },
      { q: 'Does an overdetermined system with no solution mean the lines do not all meet at one point?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '🏗️', title: 'Engineering Design', equation: '', story: 'When designing a bridge, engineers must simultaneously satisfy constraints for strength (must support heavy loads), cost (must stay within budget), and weight (must not be too heavy for the foundations). These three constraints often conflict — making the bridge stronger increases cost. Since no single design perfectly satisfies all three, engineers must find the best compromise by minimising the total error.', question: 'When a bridge must satisfy conflicting strength, cost, and weight constraints, what do engineers do?', answer: 'error' },
      { emoji: '📋', title: 'Survey Data', equation: '', story: 'A company surveys customers using multiple questions that all try to measure the same underlying satisfaction trait. Each question gives slightly different results because people interpret them differently. With more survey questions than traits to estimate, there is no perfect fit — the analysis must find the best compromise across all the questions.', question: 'What does "overdetermined" mean in the context of survey data analysis?', answer: 'more equations than unknowns' },
      { emoji: '🎯', title: 'Target Practice', equation: '', story: 'Imagine trying to hit three different targets with a single arrow. Each target requires a slightly different aim direction. Since you can only fire one arrow, you cannot hit all three — you must choose the best compromise aim that comes closest to all targets overall. This is exactly what happens with overdetermined systems.', question: 'In the target practice analogy, what does firing a single arrow represent in mathematical terms?', answer: 'one solution attempt' },
    ],
    solveExplanation: 'Two lines intersect at a point. A third line is unlikely to pass through that same point. → 3 equations in 2 unknowns: usually no solution.'
  },
  // Mission 20
  {
    id: 20, emoji: '\uD83D\uDE0A', title: 'Mood Markov Chain',
    story: 'Two states: Happy (H) and Stressed (S). Transition matrix [[0.3,0.7],[0.5,0.5]]. If 1000 people start Happy, multiply repeatedly: after 1 step → 300 Happy, 700 Stressed; after 2 steps → 440 H, 560 S; after 3 steps → 412 H, 588 S. Eventually converges to ~417 H, ~583 S no matter where you start!',
    goal: 'Compute steady-state distribution of a 2-state Markov chain.',
    ggbType: 'graphing',
    answerType: 'num',
    prompt: 'How many people end up Happy at steady state? (starting with 1000)',
    correct: 417,
    tolerance: 5,
    explanation: 'Steady state: π*P = π. Solve [h,s]*[[0.3,0.7],[0.5,0.5]] = [h,s] with h+s=1. h=0.3h+0.5s → 0.7h=0.5s → h/s=5/7. So h=5/12≈0.4167 → 417 people.',
    ggbHint: 'Type M={{0.3,0.7},{0.5,0.5}}. Multiply M*{1000,0} repeatedly. Values converge to {417,583}!',
    ggbSteps: [
      'Type: M = {{0.3,0.7},{0.5,0.5}} and press Enter.',
      'Type: {1000, 0} for 1000 Happy people initially.',
      'Type: M * {1000, 0} → {300, 700} after step 1.',
      'Keep pressing Enter to repeat M*ans.',
      'After many steps: {417, 583} — steady state!'
    ],
    quiz: [
      { q: 'Does the steady-state distribution of a Markov chain depend on the initial state?', type: 'yesno', correct: 1 },
      { q: 'Must each row of a transition matrix sum to exactly 1 (total probability)?', type: 'yesno', correct: 0 },
      { q: 'Can a Markov chain have more than one steady-state distribution?', type: 'yesno', correct: 1 }
    ],
    realLife: [
      { emoji: '📊', title: 'Employee Mood', equation: '', story: 'A company tracks whether employees feel Happy or Stressed each month. Some happy employees become stressed due to workload, and some stressed employees become happy after breaks. By modelling these mood transitions as a matrix and multiplying repeatedly, HR can predict the long-run proportion of happy vs stressed workers — regardless of the starting mood distribution.', question: 'Out of 1000 employees, approximately how many will be Happy in the long run according to the steady-state distribution?', answer: '41.7%' },
      { emoji: '📱', title: 'App Users', equation: '', story: 'A mobile app tracks users switching between Free and Premium plans each month. Some free users upgrade to Premium for extra features, while some Premium users downgrade when they want to save money. After many months, the proportions stabilise — this is the steady state of the user transition Markov chain.', question: 'In an app\'s Free/Premium user model, what does the steady-state distribution represent?', answer: 'long-term distribution' },
      { emoji: '🐂', title: 'Stock Market', equation: '', story: 'Financial models track whether the stock market is in a Bull (rising) or Bear (falling) state. Each month, there is a probability of transitioning between states. The transition matrix rows must each sum to 1 because every state must transition to some state — the probabilities of all possible outcomes always add up to 100%.', question: 'Why must each row of a Markov chain transition matrix sum to exactly 1?', answer: '1' },
    ],
    solveExplanation: 'πP=π → [h,s]*[[0.3,0.7],[0.5,0.5]]=[h,s] with h+s=1. Solving: h=5/12≈0.417, s=7/12≈0.583. Out of 1000: ~417 Happy, ~583 Stressed.'
  },
  // Mission 21
  {
     id: 21, emoji: '\uD83C\uDFD9\uFE0F', title: '3-State Location Chain',
    story: 'Three locations: Park (P), Apartment (A), Restaurant (R). Transition matrix (columns sum to 1): [[0.5,0.5,0.1],[0.3,0.1,0.8],[0.2,0.4,0.1]]. If 1000 people start in Park, multiply repeatedly until values stabilize. Steady state ~= 402 in Park, 353 in Apartment, 246 in Restaurant.',
    goal: 'Compute steady-state distribution of a 3-state Markov chain.',
    ggbType: 'graphing',
    answerType: 'num',
    prompt: 'How many people end up in Apartment at steady state? (starting with 1000 in Park)',
    correct: 353,
    tolerance: 5,
    explanation: 'Steady state: M*v = v. Solve [[0.5,0.5,0.1],[0.3,0.1,0.8],[0.2,0.4,0.1]]*[p,a,r]=[p,a,r] with p+a+r=1000. From eq1: p = a + 0.2r. Sub into eq2: a = 1.433r, so p = 1.633r. Then p+a+r = 4.067r = 1000 → r=246, a=353, p=401. ~402 Park, ~353 Apartment, ~246 Restaurant.',
    ggbHint: 'Type M={{0.5,0.5,0.1},{0.3,0.1,0.8},{0.2,0.4,0.1}}. Multiply M*{1000,0,0} repeatedly to see convergence!',
    ggbSteps: [
      'Type: M = {{0.5,0.5,0.1},{0.3,0.1,0.8},{0.2,0.4,0.1}}.',
      'Type: {1000, 0, 0} — all 1000 start in Park.',
      'Type: M * {1000, 0, 0} = {500, 300, 200} for step 1.',
      'Keep multiplying: M * ans repeatedly.',
      'Values converge to ~{402, 353, 246}!'
    ],
    quiz: [
      { q: 'Does the steady-state distribution of a 3-state Markov chain depend on the starting state?', type: 'yesno', correct: 1 },
      { q: 'Does a 3-state chain need exactly 3 equations plus normalization to find the steady state?', type: 'yesno', correct: 0 },
      { q: 'Can you use repeated matrix multiplication to find the steady state numerically?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏔️', title: 'Urban Mobility', equation: '', story: 'People in a city move between three locations daily: the Park (leisure), their Apartment (home), and a Restaurant (dining). Each hour, some people leave the park for the apartment, others head to the restaurant, and so on. By modelling these movements as a 3-state Markov chain and multiplying the transition matrix repeatedly, city planners can predict the long-run crowd distribution at each location.', question: 'According to the steady-state distribution, what percentage of people will end up at the Restaurant in the long run?', answer: '24.6%' },
      { emoji: '🛒', title: 'Shopping Patterns', equation: '', story: 'Customers in a city shop at three places: Online, Store A, and Store B. Each month, some customers switch between shopping channels based on sales, convenience, and availability. After tracking these transitions over many months, the proportions of customers at each channel stabilise to a steady state — representing the stable market share of each shopping option.', question: 'In a three-channel shopping model, what does the steady-state distribution represent for retailers?', answer: 'stable market share' },
      { emoji: '🌍', title: 'Epidemiology', equation: '', story: 'Epidemiologists track how a disease spreads through a population using three states: Susceptible (can catch the disease), Infected (currently sick), and Recovered (immune). The transition rates between these states form a Markov chain. By multiplying the transition matrix repeatedly, epidemiologists predict the long-term infection rate in the population.', question: 'What does a Markov chain model predict about the long-term spread of a disease in a population?', answer: 'long-term infection rate' },
    ],
    solveExplanation: 'M=[[0.5,0.5,0.1],[0.3,0.1,0.8],[0.2,0.4,0.1]]. Solving M*v=v with p+a+r=1000: a=353, p=402, r=246. Steady state converges regardless of start.'
  },
  // Mission 22
  {
    id: 22, emoji: '\u27A1', title: 'Perpendicular Vectors 2D',
    story: 'Draw vector [1,1]. Find all vectors [x,y] perpendicular to it: [1,1]·[x,y]=0 → x+y=0 → y=-x. Now generalize: replace [1,1] with [a,b]. For any [a,b], perpendicular vectors satisfy ax+by=0 — a whole line through origin!',
    goal: 'Find perpendicular vectors via dot product = 0.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Describe the set of all vectors [x,y] perpendicular to [1,1] (i.e., [1,1]·[x,y]=0).',
    options: null,
    correct: null,
    expectedKeywords: ['line', 'y=-x', 'y = -x', 'x+y=0', 'x + y = 0', 'through origin', 'origin'],
    explanation: '[1,1]·[x,y]=0 means x+y=0, so y=-x. This is a line through origin. For any [a,b], the perpendicular set is the line ax+by=0.',
    ggbHint: 'Type: v = (1,1). Then type: w = (x,y). Perpendicular when Dot(v,w)=0. Solve for y.',
    ggbSteps: [
      'Type: v = (1,1) and press Enter.',
      'Type: w = (x,y) and press Enter.',
      'Type: Dot(v,w)=0 → x + y = 0.',
      'So y = -x — all vectors on this line!',
      'Try with v = (a,b) — get ax + by = 0.'
    ],
    quiz: [
      { q: 'Is the dot product of two perpendicular vectors always zero?', type: 'yesno', correct: 0 },
      { q: 'Do all vectors perpendicular to [a,b] satisfy the equation ax+by=0?', type: 'yesno', correct: 0 },
      { q: 'Is the zero vector perpendicular to every vector?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏗️', title: 'Force Analysis', equation: '', story: 'When two forces act on an object at right angles to each other — like gravity pulling down and a normal force pushing up from a surface — they are perpendicular. Perpendicular forces are independent: changing one does not affect the other. Mathematically, their dot product is zero, confirming they do not interfere with each other.', question: 'What is the dot product of two perpendicular forces, and what does this tell us about their interaction?', answer: '0' },
      { emoji: '📱', title: 'Signal Processing', equation: '', story: 'In WiFi and 5G communications, data is transmitted on multiple frequency channels that are designed to be orthogonal (perpendicular) to each other. Because the channels are perpendicular, signals on different channels do not interfere — you can download a file and stream a video simultaneously without them garbling each other.', question: 'What does it mean for communication channels to be orthogonal, and why is this important?', answer: 'perpendicular' },
      { emoji: '🤖', title: 'AI & ML', equation: '', story: 'In natural language processing, words are represented as vectors in a high-dimensional space. The word "cat" and the word "dog" are similar (close together), while "cat" and "democracy" are unrelated (nearly perpendicular). This orthogonality allows AI models to distinguish between related and unrelated concepts mathematically.', question: 'In word embedding vectors, what does it mean when two word vectors are nearly perpendicular?', answer: 'perpendicular' },
    ],
    solveExplanation: 'Dot product [1,1]·[x,y]=x+y=0 → y=-x. All perpendicular vectors lie on this line through origin.'
  },
  // Mission 23
  {
    id: 23, emoji: '\uF8FF', title: '3D Perpendicular & Lines',
    story: 'Find (x,y,z) satisfying [1,2,3]·[x,y,z]=0 → x+2y+3z=0 (a plane through origin). Now plot T={α(1,2,1)} — a line through origin. Plot S={β(2,7,3)} — another line. Both lines lie in the plane x+2y+3z=0? Check: (1,2,1)·(1,2,3)=1+4+3=8≠0 — no! T and S are NOT in that plane.',
    goal: 'Explore 3D perpendicular sets (planes) and parametric lines.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What geometric shape is the set { (x,y,z) : x+2y+3z=0 }?',
    expectedKeywords: ['plane', 'plane through origin', '2d plane'],
    explanation: 'One linear equation in 3 unknowns defines a plane through the origin. T is a line in direction (1,2,1), S is a line in direction (2,7,3).',
    ggbHint: 'Type: x+2y+3z=0 to see the plane. Type: (1,2,1) to plot a point on T. Type: (2,7,3) for S.',
    ggbSteps: [
      'Type: x + 2y + 3z = 0 — see the plane.',
      'Type: (1,2,1) for a point on T line.',
      'Type: (2,7,3) for a point on S line.',
      'These points do NOT lie on the plane!',
      'T and S are lines through the origin in different directions.'
    ],
    quiz: [
      { q: 'Does the equation x+2y+3z=0 define a plane through the origin in R³?', type: 'yesno', correct: 0 },
      { q: 'Are exactly two independent equations needed to define a line (not a plane) in R³?', type: 'yesno', correct: 0 },
      { q: 'Does (2,7,3) satisfy x+2y+3z=0?', type: 'yesno', correct: 1 }
    ],
    realLife: [
      { emoji: '✈️', title: 'Flight Paths', equation: '', story: 'An aeroplane\'s feasible velocity set — all possible directions it can fly — is constrained by weather, airspace rules, and fuel. When there is one linear constraint on the velocity (like a maximum crosswind component), the set of allowed velocities forms a plane in 3D space. The plane represents all valid flight directions under that single constraint.', question: 'How many linear constraints are needed to define a plane in 3D space?', answer: 'one equation' },
      { emoji: '🤖', title: 'Robotics', equation: '', story: 'A robot arm with two joints can reach positions that satisfy one constraint — for example, the total reach cannot exceed a certain length. The set of all reachable positions satisfying this one constraint forms a surface (a plane or curved surface) in 3D space. The robot has 2 degrees of freedom — it can move in two independent directions on that surface.', question: 'If a robot arm\'s reachable positions satisfy one constraint in 3D, how many degrees of freedom does it have?', answer: '2' },
      { emoji: '🗺️', title: 'GPS', equation: '', story: 'GPS works by measuring the distance to multiple satellites. Each satellite gives one distance constraint (your position lies on a sphere centred at that satellite). To find your 3D position (latitude, longitude, altitude), you need the intersection of at least 4 spheres — because 3 spheres intersect in a circle, not a single point.', question: 'How many satellites does a GPS receiver need to determine a precise 3D position?', answer: '4' },
    ],
    solveExplanation: '[1,2,3]·[x,y,z]=0 → x+2y+3z=0 → a plane through origin. T and S are lines through origin (1D subspaces).'
  },
  // Mission 24
  {
    id: 24, emoji: '\uD83C\uDFD9\uFE0F', title: 'Span & Null Space',
    story: 'W = {α(1,2,1)+β(2,7,3)} — a plane spanned by two vectors. Now find all (x,y,z) such that EVERY w∈W satisfies w·[x,y,z]=0. That means: (1,2,1)·(x,y,z)=0 AND (2,7,3)·(x,y,z)=0. Solve: x+2y+z=0, 2x+7y+3z=0 → x=y, z=-3x → (x,y,z)=t(1,1,-3). This is the NULL SPACE of the plane!',
    goal: 'Find the null space (perpendicular set) of a 2D plane in 3D.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'Is the set of vectors perpendicular to every vector in a 2D plane in R³ a line through the origin?',
    options: null,
    correct: 0,
    explanation: 'Two independent equations in 3 unknowns give a 1D solution = line through origin. Direction: (1,1,-3). This line is the null space — perpendicular to the entire plane W.',
    ggbHint: 'Type: plane = z = -x-2y. Then type: (1,1,-3). Is it perpendicular to (1,2,1) and (2,7,3)?',
    ggbSteps: [
      'Type: x+2y+z=0 and 2x+7y+3z=0.',
      'Solve: from first, z = -x-2y.',
      'Sub in second: 2x+7y+3(-x-2y)=0 → -x+y=0 → x=y.',
      'Then z = -x-2x = -3x.',
      'So (x,y,z) = t*(1,1,-3) — a LINE!'
    ],
    quiz: [
      { q: 'When you have 2 independent equations in 3 unknowns, does exactly 1 free variable remain?', type: 'yesno', correct: 0 },
      { q: 'Is the null space direction of W = span{(1,2,1),(2,7,3)} given by (1,1,-3)?', type: 'yesno', correct: 0 },
      { q: 'Is the null space always perpendicular to the plane it is derived from?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🛡️', title: 'Computer Graphics', equation: '', story: 'When a 3D scene is rendered on your 2D screen, the camera looks along a specific direction. This viewing direction is perpendicular to the image plane — it is the null space direction of the projection. Objects along this direction are flattened onto the screen, while objects perpendicular to it (sideways) remain visible.', question: 'In 3D rendering, what does the camera\'s viewing direction correspond to mathematically?', answer: 'null space of plane' },
      { emoji: '📈', title: 'Data Science', equation: '', story: 'Principal Component Analysis (PCA) finds the directions in your data where the variance is highest (the principal components) and where it is lowest. The low-variance directions — the null space of the data\'s structure — represent noise or redundant information that can be safely discarded for dimensionality reduction.', question: 'What does PCA identify as the directions that can be safely discarded?', answer: 'perpendicular directions' },
      { emoji: '🏗️', title: 'Structural Engineering', equation: '', story: 'When you push on a beam perpendicular to its length (like pressing down on a diving board from the side), you are not stretching or compressing it — you are bending it. Forces in the null space of the beam\'s axial direction do no work along the beam\'s length. They act independently of the stretching forces.', question: 'What happens when a force is applied perpendicular to a beam\'s length — does it stretch the beam?', answer: 'no work' },
    ],
    solveExplanation: 'W = span{(1,2,1),(2,7,3)}. Perpendicular condition: (1,2,1)·(x,y,z)=0 and (2,7,3)·(x,y,z)=0. Solving: x=y, z=-3x → line t*(1,1,-3).'
  },
  // Mission 25
  {
    id: 25, emoji: '\uD83D\uDCCA', title: 'Matrix Null Space',
    story: "A = [[1,2,3],[4,5,6],[7,8,9]]. Find all (x,y,z) with A*(x,y,z)=0. This means: x+2y+3z=0, 4x+5y+6z=0, 7x+8y+9z=0. Row3 = Row2 - Row1 (redundant!). Solve first two: x+2y+3z=0, 4x+5y+6z=0 → subtract 4×first from second: -3y-6z=0 → y=-2z, then x=z. So (x,y,z)=t*(1,-2,1)! Connection: this is the NULL SPACE of A — just like all previous perpendicular questions!",
    goal: 'Compute the null space of a 3×3 singular matrix.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Find a non-zero vector (x,y,z) satisfying A*(x,y,z) = (0,0,0)',
    expectedKeywords: ['(1,-2,1)', '1,-2,1', '(1, -2, 1)', 't*(1,-2,1)', 't(1,-2,1)'],
    explanation: 'A has rank 2 (row3 = row2 - row1), so null space is 1D. Solving gives (x,y,z)=t*(1,-2,1). This is the same idea as previous questions: find vectors orthogonal to all rows.',
    ggbHint: 'Type M={{1,2,3},{4,5,6},{7,8,9}}. Find Det(M) — it\'s 0! Solve M*{x,y,z}={0,0,0}.',
    ggbSteps: [
      'Type: M = {{1,2,3},{4,5,6},{7,8,9}}.',
      'Type: Determinant(M) — ZERO! Matrix is singular.',
      'Type: Solve(M*{x,y,z}={0,0,0},{x,y,z}).',
      'Result: {x=z, y=-2z} — one free variable.',
      'So (x,y,z) = t*(1,-2,1) — a line!'
    ],
    quiz: [
      { q: 'Is the rank of [[1,2,3],[4,5,6],[7,8,9]] equal to 2?', type: 'yesno', correct: 0 },
      { q: 'Is the null space direction of [[1,2,3],[4,5,6],[7,8,9]] given by (1,-2,1)?', type: 'yesno', correct: 0 },
      { q: 'Is the null space perpendicular to every row of the matrix?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '📷', title: 'Image Compression', equation: '', story: 'When you compress an image (like saving as JPEG), some fine details are discarded to reduce file size. Mathematically, these discarded details correspond to components in the null space of the compression matrix. The information that lies along null space directions is permanently lost during compression.', question: 'What do the null space components of an image compression matrix represent?', answer: 'null space components' },
      { emoji: '🔊', title: 'Audio Filtering', equation: '', story: 'When you remove background noise from an audio recording, you are filtering out specific frequency components. The noise lives in the null space of the desired signal — it is orthogonal to the clean audio. By projecting the recording onto the subspace orthogonal to the null space, you isolate the clean signal and discard the noise.', question: 'In audio noise removal, what does the null space of the filtering operation contain?', answer: 'filtered-out noise' },
      { emoji: '🏗️', title: 'Vibration Analysis', equation: '', story: 'When engineers analyse how a bridge vibrates, they compute the stiffness matrix of the structure. The null space of this matrix represents vibration modes that require zero energy — the structure can move in these patterns without any restoring force. These are called rigid body modes, and they indicate ways the structure can move freely.', question: 'What do the zero-energy modes in the null space of a stiffness matrix represent?', answer: 'zero-energy modes' },
    ],
    solveExplanation: 'A=[[1,2,3],[4,5,6],[7,8,9]] has rank 2. Solving Ax=0: x=z, y=-2z → null space = t*(1,-2,1). Perpendicular to all rows!'
  },
  // Mission 26
  {
    id: 26, emoji: '\uD83D\uDD2D', title: 'Three Subspaces',
    story: "A = [[1,2,3],[4,5,6],[7,8,9]]. Three sets: \u211C={α(1,2,3)+β(4,5,6)+γ(7,8,9)} = ROW SPACE (span of rows). C={α(1,4,7)+β(2,5,8)+γ(3,6,9)} = COLUMN SPACE (span of columns). N={(x,y,z)|x(1,4,7)+y(2,5,8)+z(3,6,9)=0} = NULL SPACE. Observe: every vector in \u211C is perpendicular to every vector in N! This is the FUNDAMENTAL THEOREM of linear algebra.",
    goal: 'Identify row space, column space, and null space; see row space ⟂ null space.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'Are the row space and null space of any matrix always perpendicular to each other?',
    options: null,
    correct: 0,
    explanation: 'The Fundamental Theorem: Row space ⟂ Null space. Every row dot every null vector = 0. For A, ℛ=span{(1,2,3),(4,5,6)} and N=span{(1,-2,1)}. Check: (1,2,3)·(1,-2,1)=0, (4,5,6)·(1,-2,1)=0.',
    ggbHint: 'Type: r1=(1,2,3), r2=(4,5,6), n=(1,-2,1). Compute Dot(r1,n) and Dot(r2,n). Both are 0!',
    ggbSteps: [
      'Type: r1=(1,2,3), r2=(4,5,6), n=(1,-2,1).',
      'Type: Dot(r1,n) → 0. Perpendicular!',
      'Type: Dot(r2,n) → 0. Also perpendicular!',
      'Row space = plane, Null space = line.',
      'Together they span ALL of space!'
    ],
    quiz: [
      { q: 'Is the dimension of the row space of [[1,2,3],[4,5,6],[7,8,9]] equal to 2?', type: 'yesno', correct: 0 },
      { q: 'Do the row space and null space together span the entire input space?', type: 'yesno', correct: 0 },
      { q: 'Is every row vector always orthogonal to every null space vector (Ax=0)?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '🏆', title: 'Recommendation Systems', equation: '', story: 'Netflix uses matrix factorisation to recommend movies. Your viewing preferences live in the row space of the rating matrix — the meaningful patterns. The null space represents irrelevant features that do not contribute to recommendations. By separating these two subspaces, Netflix can focus on the patterns that actually matter for predicting what you will enjoy.', question: 'In Netflix\'s recommendation algorithm, what does the null space of the rating matrix represent?', answer: 'irrelevant features' },
      { emoji: '📈', title: 'Economics', equation: '', story: 'Input-output models in economics describe how different sectors of an economy interact. The row space of the interaction matrix represents growth directions — sectors that drive economic expansion. The null space represents equilibrium states — flows that cancel each other out, producing no net change in the economy.', question: 'In an economic input-output model, what does the null space represent?', answer: 'null space' },
      { emoji: '🏗️', title: 'Control Theory', equation: '', story: 'In control systems, the row space of the system matrix represents controllable states — parts of the system you can influence with your inputs. The null space represents uncontrollable states — aspects of the system that your inputs cannot affect. Good control system design ensures the null space is as small as possible.', question: 'In control theory, which subspace represents the states you can control?', answer: 'row space' },
    ],
    solveExplanation: 'Fundamental Theorem: Row space ⟂ Null space. ℛ=span{(1,2,3),(4,5,6)}, N=span{(1,-2,1)}. Check dot products = 0!'
  },
  // Mission 27
  {
    id: 27, emoji: '\uD83D\uDDD1\uFE0F', title: 'Collapsing Dimension',
    story: 'B = [[1,2],[2,4]] as a function B:\u211D\u00B2\u2192\u211D\u00B2. Line 2y+x=4: apply B → B*(x,y) = (x+2y, 2x+4y) = (x+2y, 2(x+2y)). Since x+2y=4 → B maps EVERY point on the line to (4,8)! The whole line collapses to a single point! For any k, 2y+x=k maps to (k,2k). Range of B = {t*(1,2)} — a 1D line! B COLLAPSES a dimension!',
    goal: 'See how a singular matrix collapses lines/planes onto lower dimensions.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What geometric shape is the range (output set) of B = [[1,2],[2,4]]?',
    options: null,
    correct: null,
    expectedKeywords: ['line', 'line through origin', '1D', 'one-dimensional', 't(1,2)'],
    explanation: 'det(B)=0, so B is singular. B maps 2D plane onto a 1D line (direction (1,2)). Any line 2y+x=k maps to point (k,2k). Information along perpendicular direction is LOST — dimension collapses!',
    ggbHint: 'Type: B={{1,2},{2,4}}. Type: B*{4,0} and B*{2,1}. Both points on 2y+x=4 give the same result!',
    ggbSteps: [
      'Type: B = {{1,2},{2,4}}.',
      'Type: B*{4,0} → (4,8).',
      'Type: B*{2,1} → (4,8) again! Same output!',
      'All points on 2y+x=4 map to (4,8).',
      'B collapses entire lines to points!'
    ],
    quiz: [
      { q: 'Is the determinant of [[1,2],[2,4]] equal to zero?', type: 'yesno', correct: 0 },
      { q: 'Does the matrix [[1,2],[2,4]] map distinct parallel lines to distinct points?', type: 'yesno', correct: 0 },
      { q: 'Does the matrix [[1,2],[2,4]] map the entire line 2y+x=4 to the single point (4,8)?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '📷', title: '3D to 2D Photo', equation: '', story: 'When you take a photo with your phone camera, the 3D world in front of you is projected onto a flat 2D sensor. Millions of points at different depths in the real world all land on the same spot in the image — the depth dimension is collapsed. This is exactly what a singular matrix does: it maps a higher-dimensional space onto a lower-dimensional one, losing information in the process.', question: 'When a camera collapses 3D onto 2D, which dimension is lost — and what mathematical concept does this represent?', answer: 'depth' },
      { emoji: '📈', title: 'Data Compression', equation: '', story: 'Principal Component Analysis (PCA) reduces the dimensionality of data by keeping only the directions of highest variance and discarding the rest. The discarded directions form the null space of the compression. Like a singular matrix, PCA collapses many dimensions into fewer ones, sacrificing some detail for efficiency.', question: 'In PCA dimensionality reduction, what mathematical concept represents the directions that are dropped?', answer: 'null space' },
      { emoji: '🎯', title: 'Shadow Projection', equation: '', story: 'When sunlight casts a shadow of a 3D object onto a flat wall, the shadow is a 2D projection — one dimension (depth relative to the wall) is lost. Every point along the line from the object to the wall produces the same shadow point. This is a physical example of a singular matrix collapsing one dimension.', question: 'When a 3D object casts a 2D shadow, what happens to the depth dimension?', answer: 'one dimension' },
    ],
    solveExplanation: 'B=[[1,2],[2,4]] has det=0. 2y+x=k maps to (k,2k) — lines collapse to points. Range = line t*(1,2). B collapses 2D → 1D.'
  },
  // Mission 28
  {
    id: 28, emoji: '\uD83D\uDDFA\uFE0F', title: 'Span Plot 3D',
    story: 'W = { \u03b1(1,2,1) + \u03b2(2,7,3) | \u03b1,\u03b2 \u2208 \u211D }. Plot the two vectors and their span in GeoGebra 3D. What shape does W make? Hint: two non-parallel vectors in 3D sweep out a flat surface through the origin.',
    goal: 'Visualize the span of two vectors as a plane through the origin in 3D.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What geometric object does W = span{(1,2,1), (2,7,3)} represent in R³?',
    options: null,
    correct: null,
    expectedKeywords: ['plane', 'plane through origin', '2D', 'two-dimensional'],
    explanation: 'Two linearly independent vectors in \u211D\u00B3 span a 2D plane through the origin. W = { \u03b1(1,2,1) + \u03b2(2,7,3) } = all linear combinations = a plane!',
    ggbHint: 'Switch to 3D Graphics. Type: v=(1,2,1) and w=(2,7,3). Then type: Plane(v,w) to see the span.',
    ggbSteps: [
      'Click View \u2192 3D Graphics to open the 3D view.',
      'Type: v = (1,2,1) and press Enter.',
      'Type: w = (2,7,3) and press Enter.',
      'Type: Plane(v, w) and press Enter — this is W!',
      'Drag to rotate the 3D view and see the plane through origin.'
    ],
    quiz: [
      { q: 'Are exactly 2 linearly independent vectors needed to span a plane in R³?', type: 'yesno', correct: 0 },
      { q: 'Does the origin always belong to any span of vectors?', type: 'yesno', correct: 0 },
      { q: 'If two vectors in R³ are scalar multiples, does their span produce a line (not a plane)?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '✈️', title: 'Flight Routes', equation: '', story: 'An aeroplane can move in multiple directions simultaneously — forward and sideways, for example. The set of all possible velocity combinations forms a plane (the span of two direction vectors). Any velocity that is a linear combination of these basis directions is achievable. This is why two independent direction vectors span a 2D plane of reachable velocities.', question: 'What does the span of two independent direction vectors in 3D represent for an aeroplane?', answer: 'plane' },
      { emoji: '🤖', title: 'Robotic Arm', equation: '', story: 'A robotic arm with two joints can reach any position that is a combination of its two joint movements. The first joint sweeps out one direction, the second joint sweeps out another. Together, their span forms a flat surface (a plane) of all reachable positions. Any position on this plane can be achieved by the right combination of joint angles.', question: 'What does the span of two joint movement vectors represent for a robotic arm?', answer: 'reachable positions' },
      { emoji: '🌍', title: 'GPS', equation: '', story: 'GPS uses distances from satellites to pinpoint your location. Two satellite range measurements (each giving a sphere) intersect in a circle — a 1D curve. Adding a third satellite narrows it down further. The span of two satellite direction vectors forms a plane of possible positions, and each additional satellite constrains it further.', question: 'What geometric shape do the span of two satellite direction vectors define?', answer: 'plane' },
    ],
    solveExplanation: 'W = span{(1,2,1), (2,7,3)} = { \u03b1(1,2,1) + \u03b2(2,7,3) }. Two independent vectors in \u211D\u00B3 always span a plane through the origin!'
  },
  // Mission 29
  {
    id: 29, emoji: '\u27A1', title: 'Perpendicular to Plane',
    story: 'In Q1 (Mission 28), W was a plane through origin. Now find ALL vectors (x,y,z) that are perpendicular to EVERY vector in W. This is the NULL SPACE of W. Every w\u2208W must satisfy w\u00b7(x,y,z)=0, so in particular: (1,2,1)\u00b7(x,y,z)=0 AND (2,7,3)\u00b7(x,y,z)=0.',
    goal: 'Find the line through origin perpendicular to a given plane (the null space).',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What is the null space direction of W = span{(1,2,1), (2,7,3)}? Find the vector (x,y,z) perpendicular to both.',
    options: null,
    correct: null,
    expectedKeywords: ['(1,1,-3)', '1,1,-3', '(1, 1, -3)', 't(1,1,-3)'],
    explanation: 'Solve: x+2y+z=0 and 2x+7y+3z=0. Subtract 2\u00d7first from second: 3y+z=0 \u2192 z=-3y. Then x+2y-3y=0 \u2192 x=y. So (x,y,z) = t(1,1,-3) — a LINE through origin! This is the null space of the plane W.',
    ggbHint: 'Type: Solve({x+2y+z=0, 2x+7y+3z=0}, {x,y,z}). GeoGebra gives the parametric solution!',
    ggbSteps: [
      'Type: x + 2y + z = 0 and press Enter (a plane).',
      'Type: 2x + 7y + 3z = 0 and press Enter (another plane).',
      'The intersection of these two planes is a LINE.',
      'Type: (1,1,-3) and check if it satisfies both equations.',
      'All points t(1,1,-3) are perpendicular to the whole plane W!'
    ],
    quiz: [
      { q: 'Do two planes in R³ typically intersect in a line?', type: 'yesno', correct: 0 },
      { q: 'Is the null space direction of W given by (1,1,-3)?', type: 'yesno', correct: 0 },
      { q: 'Is the null space perpendicular to every vector in the plane W?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '📷', title: 'Camera View', equation: '', story: 'When a camera takes a photo, it looks along a direction that is perpendicular to the image plane. This viewing direction is the null space of the projection — it is the one direction that gets completely flattened onto the sensor. Everything along this direction collapses to a point, while directions perpendicular to it remain visible.', question: 'What does the camera\'s viewing direction correspond to in terms of the image plane\'s subspaces?', answer: 'null space of image plane' },
      { emoji: '🏗️', title: 'Structural Forces', equation: '', story: 'When you apply a force perpendicular to a beam (like pushing sideways on a diving board), that force does not stretch or compress the beam along its length. The perpendicular force is in the null space of the beam\'s axial direction — it produces no work along that axis. Only forces aligned with the beam\'s length can stretch or compress it.', question: 'What happens to a beam when a force is applied in the null space of its axial direction?', answer: 'no work' },
      { emoji: '📈', title: 'Data PCA', equation: '', story: 'PCA finds the principal components of your data — the directions of maximum variance. The null space of the data matrix contains directions of minimum or zero variance. These low-variance directions represent noise or redundant features that can be discarded. PCA separates the signal (row space) from the noise (null space).', question: 'In PCA, what do the low-variance directions in the null space of the data represent?', answer: 'minimum variance' },
    ],
    solveExplanation: '(1,2,1)\u00b7(x,y,z)=0 and (2,7,3)\u00b7(x,y,z)=0 \u2192 x=y, z=-3x \u2192 (x,y,z) = t(1,1,-3). A line through origin perpendicular to the plane W!'
  },
  // Mission 30
  {
    id: 30, emoji: '\uD83D\uDCCA', title: 'Null Space Again',
    story: 'A = [[1,4,7],[2,5,8],[3,6,9]]. Find all (x,y,z) such that A*(x,y,z) = (0,0,0). Write out: x+4y+7z=0, 2x+5y+8z=0, 3x+6y+9z=0. Notice: Row3 = 2\u00d7Row2 \u2212 Row1, so redundant! Solve the first two and find the null space direction.',
    goal: 'Compute the null space of a different 3\u00d73 singular matrix.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Find a non-zero vector (x,y,z) satisfying A*(x,y,z) = (0,0,0) for A = [[1,4,7],[2,5,8],[3,6,9]]',
    expectedKeywords: ['(1,-2,1)', '1,-2,1', '(1, -2, 1)', 't(1,-2,1)', 't*(1,-2,1)'],
    explanation: 'x+4y+7z=0 and 2x+5y+8z=0. Subtract 2\u00d7first from second: -3y-6z=0 \u2192 y=-2z. Then x+4(-2z)+7z=0 \u2192 x-z=0 \u2192 x=z. So (x,y,z) = t(1,-2,1). Same null space direction as the previous matrix!',
    ggbHint: 'Type: M={{1,4,7},{2,5,8},{3,6,9}}. Compute Det(M) — it is 0! Solve(M*{x,y,z}={0,0,0},{x,y,z}).',
    ggbSteps: [
      'Type: M = {{1,4,7},{2,5,8},{3,6,9}}.',
      'Type: Determinant(M) — ZERO! Matrix is singular.',
      'Type: Solve(M*{x,y,z}={0,0,0},{x,y,z}).',
      'Result: {x=z, y=-2z} — one free variable.',
      'So null space = t(1,-2,1) — a line!'
    ],
    quiz: [
      { q: 'Is the determinant of [[1,4,7],[2,5,8],[3,6,9]] equal to zero?', type: 'yesno', correct: 0 },
      { q: 'Is the null space direction of [[1,4,7],[2,5,8],[3,6,9]] given by (1,-2,1)?', type: 'yesno', correct: 0 },
      { q: 'Does the null space direction depend on which specific rows are redundant?', type: 'yesno', correct: 1 }
    ],
    realLife: [
      { emoji: '📷', title: 'Image Compression', equation: '', story: 'When JPEG compresses an image, it discards components that lie in the null space of the compression transform. These are the fine details and subtle colour variations that the human eye barely notices. By throwing away null-space components, the file size shrinks dramatically while the image still looks almost the same.', question: 'In JPEG image compression, what happens to the components that lie in the null space of the transform?', answer: 'null space components' },
      { emoji: '🔊', title: 'Audio Noise', equation: '', story: 'Audio filters work by separating the desired signal from unwanted noise. The clean audio lives in a subspace, and the noise lives in a different subspace. By projecting the recording onto the subspace orthogonal to the null space, the filter removes the noise while preserving the speech or music you want to hear.', question: 'In audio filtering, where does the unwanted noise typically live mathematically?', answer: 'null space' },
      { emoji: '🏗️', title: 'Vibration', equation: '', story: 'When engineers analyse a bridge or building for vibrations, they compute the stiffness matrix. The null space of this matrix contains vibration modes that require zero energy to excite — the structure can摆动freeways without any restoring force. These are called rigid body modes and are critical for understanding structural stability.', question: 'What do the zero-energy vibration modes in the null space of a stiffness matrix represent?', answer: 'zero-energy modes' },
    ],
    solveExplanation: 'A=[[1,4,7],[2,5,8],[3,6,9]]. Solving Ax=0: from first two eqns, y=-2z, x=z \u2192 (x,y,z) = t(1,-2,1). Same null space as before!'
  },
  // Mission 31
  {
    id: 31, emoji: '\uD83D\uDD2D', title: 'Three Spaces Again',
    story: 'With A = [[1,4,7],[2,5,8],[3,6,9]], identify three fundamental subspaces: \u211C = Row Space = span of rows = { \u03b1(1,4,7) + \u03b2(2,5,8) + \u03b3(3,6,9) }, C = Column Space = span of columns = { \u03b1(1,2,3) + \u03b2(4,5,6) + \u03b3(7,8,9) }, N = Null Space = { (x,y,z) | A*(x,y,z) = 0 } = t(1,-2,1). Visualize each set in GeoGebra!',
    goal: 'Identify Row Space, Column Space, and Null Space of A.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What is the dimension of the Row Space of A = [[1,4,7],[2,5,8],[3,6,9]]?',
    options: null,
    correct: null,
    expectedKeywords: ['2', '2D', 'plane', 'plane through origin'],
    explanation: 'Since det(A)=0, A has rank 2. The row space is a plane through origin (2D), column space is also a plane (2D), and null space is a line (1D). Rank-Nullity: rank + nullity = 3 \u2192 2 + 1 = 3.',
    ggbHint: 'Plot rows as points: (1,4,7), (2,5,8). Plot the plane they span. Plot null direction (1,-2,1).',
    ggbSteps: [
      'Type: r1=(1,4,7), r2=(2,5,8) — two rows.',
      'Type: Plane(r1, r2) — this is the Row Space \u211C!',
      'Type: n=(1,-2,1) — the null space direction.',
      'Type: Dot(r1,n) and Dot(r2,n) — both 0!',
      'Row space plane and null space line are perpendicular!'
    ],
    quiz: [
      { q: 'Is the rank of [[1,4,7],[2,5,8],[3,6,9]] equal to 2?', type: 'yesno', correct: 0 },
      { q: 'Is the nullity (dimension of null space) of [[1,4,7],[2,5,8],[3,6,9]] equal to 1?', type: 'yesno', correct: 0 },
      { q: 'Do the row space and column space always have the same dimension?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏆', title: 'Recommendation Systems', equation: '', story: 'Netflix decomposes its user-movie rating matrix into subspaces. The row space captures meaningful user preferences — what genres and styles each user enjoys. The null space captures irrelevant patterns that do not help with recommendations. By focusing on the row space and filtering out the null space, Netflix delivers more accurate personalised suggestions.', question: 'In Netflix\'s recommendation system, which subspace contains the meaningful user preference patterns?', answer: 'user preferences' },
      { emoji: '📈', title: 'Economics', equation: '', story: 'In economic input-output analysis, the column space of the technology matrix represents all achievable output combinations. If a country\'s industries can produce certain goods, the column space tells you every possible bundle of goods that can be manufactured from available resources and technology.', question: 'In an input-output economic model, what does the column space represent?', answer: 'reachable outputs' },
      { emoji: '🏗️', title: 'Control Theory', equation: '', story: 'In engineering control systems, the row space of the system matrix represents the states you can control with your inputs. The null space represents states that your inputs cannot influence at all. A well-designed controller minimises the null space so that you can steer the system in as many directions as possible.', question: 'Which subspace represents the uncontrollable states in a control system?', answer: 'null space' },
    ],
    solveExplanation: 'A has rank 2. Row space = plane, Column space = plane, Null space = line t(1,-2,1). rank(2) + nullity(1) = 3 dimensions!'
  },
  // Mission 32
  {
    id: 32, emoji: '\u2716', title: 'Check Orthogonality',
    story: 'Verify using GeoGebra that every vector in \u211C (Row Space) is perpendicular to every vector in N (Null Space) for A = [[1,4,7],[2,5,8],[3,6,9]]. Take r1=(1,4,7), r2=(2,5,8), n=(1,-2,1). Compute dot products and see!',
    goal: 'Verify the Fundamental Theorem: Row Space \u22a5 Null Space.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'Is the dot product (1,4,7)·(1,-2,1) equal to zero, confirming these vectors are perpendicular?',
    options: null,
    correct: 0,
    explanation: '(1,4,7)\u00b7(1,-2,1) = 1\u00b71 + 4\u00b7(-2) + 7\u00b71 = 1 - 8 + 7 = 0. Similarly (2,5,8)\u00b7(1,-2,1) = 2 - 10 + 8 = 0. Every row is orthogonal to every null space vector. This is the Fundamental Theorem!',
    ggbHint: 'Type: r1=(1,4,7), r2=(2,5,8), n=(1,-2,1). Type: Dot(r1,n) and Dot(r2,n). Both are 0!',
    ggbSteps: [
      'Type: r1 = (1,4,7) and press Enter.',
      'Type: r2 = (2,5,8) and press Enter.',
      'Type: n = (1,-2,1) and press Enter.',
      'Type: Dot(r1, n) — GeoGebra shows 0!',
      'Type: Dot(r2, n) — also 0! Row space \u22a5 Null space.'
    ],
    quiz: [
      { q: 'Is (1,4,7)·(1,-2,1) = 0?', type: 'yesno', correct: 0 },
      { q: 'If Dot(r,n)=0 for a row r and null vector n, does this confirm they are perpendicular?', type: 'yesno', correct: 0 },
      { q: 'Does every row of A have dot product 0 with every null space vector?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🖥️', title: 'Computer Graphics', equation: '', story: 'In 3D rendering, light and shadow are separated using orthogonal bases. Light directions live in the row space of the surface normal matrix, while shadow directions live in the null space. Because these subspaces are perpendicular (dot product = 0), the renderer can compute lighting and shadowing independently without them affecting each other.', question: 'In computer graphics rendering, what does it mean when two subspaces are orthogonal (dot product = 0)?', answer: 'dot product = 0' },
      { emoji: '📱', title: 'Signal Processing', equation: '', story: 'Orthogonal Frequency Division Multiplexing (OFDM) is the technology behind WiFi and 4G/5G. It splits data across many frequency channels that are mathematically orthogonal to each other. Because the channels are perpendicular, signals on different channels never interfere — your video stream and your neighbour\'s web browsing coexist peacefully.', question: 'Why are orthogonal frequency channels important in WiFi and 5G communications?', answer: 'no interference' },
      { emoji: '🤖', title: 'AI Embeddings', equation: '', story: 'Modern AI systems represent words, images, and concepts as high-dimensional vectors. Unrelated concepts (like "cat" and "democracy") have nearly perpendicular vectors, while related concepts (like "cat" and "kitten") have similar vectors. This orthogonality allows AI to mathematically distinguish between related and unrelated information.', question: 'In AI word embeddings, what does it mean when two concept vectors are perpendicular?', answer: 'perpendicular vectors' },
    ],
    solveExplanation: '(1,4,7)\u00b7(1,-2,1) = 1-8+7 = 0. (2,5,8)\u00b7(1,-2,1) = 2-10+8 = 0. Fundamental Theorem: Row Space \u22a5 Null Space!'
  },
  // Mission 33
  {
    id: 33, emoji: '\uD83D\uDCC9', title: 'Line to Point',
    story: 'B = [[1,2],[2,4]] maps \u211D\u00B2 \u2192 \u211D\u00B2. Plot the line 2y + x = 4. For every point on this line, compute B*(x,y) = (x+2y, 2x+4y). Since x+2y=4 on this line, B*(x,y) = (4, 8) for EVERY point on the line! The entire line collapses to a single point!',
    goal: 'See how a singular matrix collapses a whole line to a single point.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What happens to every point on the line 2y + x = 4 when B = [[1,2],[2,4]] is applied?',
    options: null,
    correct: null,
    expectedKeywords: ['collapse', 'point', '(4,8)', 'same', 'single', '4,8'],
    explanation: 'For any (x,y) on 2y+x=4, B*(x,y) = (x+2y, 2x+4y) = (4, 2\u00d74) = (4,8). The entire line maps to a single point! B loses information along the direction perpendicular to (1,2).',
    ggbHint: 'Type: B={{1,2},{2,4}}. Pick two points on the line 2y+x=4, e.g. (4,0) and (2,1). Apply B to both — same result!',
    ggbSteps: [
      'Type: B = {{1,2},{2,4}} and press Enter.',
      'Type: B*{4,0} — results in (4,8).',
      'Type: B*{2,1} — also (4,8)! Same output!',
      'Every point on 2y+x=4 maps to the same point.',
      'B collapses the whole line to a single point!'
    ],
    quiz: [
      { q: 'Is the determinant of B = [[1,2],[2,4]] equal to zero?', type: 'yesno', correct: 0 },
      { q: 'Do all points on the line 2y+x=4 map to the single point (4,8) under B?', type: 'yesno', correct: 0 },
      { q: 'Does a non-singular matrix (det≠0) also collapse lines to single points?', type: 'yesno', correct: 1 }
    ],
    realLife: [
      { emoji: '📷', title: 'Camera Projection', equation: '', story: 'When a camera captures a scene, many different 3D points in the real world can land on the exact same 2D pixel in the image. A person standing 2 metres away and a tree 20 metres away might both appear at the same spot in the photo. The camera\'s projection matrix is singular — it maps many 3D points to one pixel, collapsing depth information.', question: 'When many 3D points in the real world map to the same pixel in a photo, what does this tell us about the camera\'s transformation?', answer: 'one pixel' },
      { emoji: '📋', title: 'Data Aggregation', equation: '', story: 'When a company sums up sales data by region, thousands of individual transactions are collapsed into a single total for each region. This is like applying a singular matrix — many distinct data points are mapped to one aggregate value. Detailed information about individual transactions is lost in the aggregation process.', question: 'When individual sales transactions are summed by region, what mathematical operation is being performed?', answer: 'collapsing data' },
      { emoji: '🎯', title: 'Shadow', equation: '', story: 'A 3D object casts a 2D shadow on a wall. Many different points on the object — at different depths — all produce the same point on the shadow. The shadow projection is a singular transformation that collapses one dimension. Points that are far apart in 3D can be right on top of each other in the 2D shadow.', question: 'When a 3D object casts a 2D shadow, what happens to points that are at different depths?', answer: 'one dimension' },
    ],
    solveExplanation: 'B=[[1,2],[2,4]] has det=0. On line 2y+x=4: B*(x,y) = (x+2y, 2x+4y) = (4, 8) for ALL points. Whole line collapses to one point!'
  },
  // Mission 34
  {
    id: 34, emoji: '\uD83D\uDCC8', title: 'Many Lines Collapse',
    story: 'Same B = [[1,2],[2,4]]. Now try different lines parallel to 2y+x=4: (i) 2y+x=10, (ii) 2y+x=62, (iii) 2y+x=1800. For each line k, compute B*(x,y) for any (x,y) on the line. What do all points on line 2y+x=k map to?',
    goal: 'Discover that each parallel line collapses to a different point.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Under B = [[1,2],[2,4]], what point does the line 2y + x = k map to?',
    options: null,
    correct: null,
    expectedKeywords: ['(k, 2k)', '(k,2k)', 'k,2k', 'k, 2k'],
    explanation: 'For any (x,y) on 2y+x=k, B*(x,y) = (x+2y, 2x+4y) = (k, 2k). Each distinct k gives a distinct output point (k, 2k). Parallel lines map to different points on the range line!',
    ggbHint: 'Pick points on different lines: (10,0) for k=10, (62,0) for k=62, (1800,0) for k=1800. Apply B to each.',
    ggbSteps: [
      'Type: B = {{1,2},{2,4}}.',
      'Type: B*{10,0} → (10,20) for the line 2y+x=10.',
      'Type: B*{62,0} → (62,124) for 2y+x=62.',
      'Type: B*{1800,0} → (1800,3600) for 2y+x=1800.',
      'Each line 2y+x=k maps to (k, 2k)!'
    ],
    quiz: [
      { q: 'Does the line 2y+x=10 map to (10,20) under B=[[1,2],[2,4]]?', type: 'yesno', correct: 0 },
      { q: 'Does the line 2y+x=62 map to (62,124) under B=[[1,2],[2,4]]?', type: 'yesno', correct: 0 },
      { q: 'Do different values of k always give different output points?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '📊', title: 'Income Brackets', equation: '', story: 'Tax systems group people into income brackets. Everyone earning between Rs5-10 lakh pays one tax rate, everyone between Rs10-20 lakh pays another. Each bracket (a line of constant tax rate) maps to a distinct tax amount. People in different brackets end up with different tax bills — each bracket maps to a unique output point.', question: 'When different income brackets map to different tax amounts, what does each bracket represent in terms of the transformation?', answer: 'different points' },
      { emoji: '🛒', title: 'Pricing Tiers', equation: '', story: 'A wholesale supplier offers different pricing tiers: buying 1-10 kg costs Rs100/kg, buying 11-50 kg costs Rs80/kg, and buying 50+ kg costs Rs60/kg. Each quantity tier forms a line, and each line maps to a distinct total price point. Customers in different tiers get different final prices.', question: 'In a tiered pricing system, what does each quantity tier map to?', answer: 'distinct price' },
      { emoji: '🏃', title: 'Race Times', equation: '', story: 'In a race, finishing times are grouped into bands: under 10 seconds, 10-12 seconds, 12-15 seconds. Each time band maps to a distinct score or ranking. Runners who finish in the same time band get the same score, while different bands produce different scores — each band is mapped to a unique output.', question: 'When race finishing time bands are converted to scores, what does each distinct time band produce?', answer: 'different scores' },
    ],
    solveExplanation: 'For 2y+x=k: B*(x,y) = (x+2y, 2x+4y) = (k, 2k). Each distinct k \u2192 distinct point (k,2k) on the range line t(1,2).'
  },
  // Mission 35
  {
    id: 35, emoji: '\u221E', title: 'General Collapse Formula',
    story: 'Generalize: B = [[1,2],[2,4]] maps the line 2y + x = k to (k, 2k). The range of B is all points of the form t*(1,2) — a line through origin. Every point in the output space gets contributions only along direction (1,2). The perpendicular direction (2,-1) is the null space — all info along it is LOST.',
    goal: 'Derive the general formula: B maps 2y+x=k to (k,2k).',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What is the null space direction of B = [[1,2],[2,4]]? (Find non-zero (x,y) with B*(x,y) = (0,0))',
    expectedKeywords: ['(2,-1)', '2,-1', '(2, -1)', 't(2,-1)', 't*(2,-1)', '(-2,1)', 'x=-2y', 'y=-x/2'],
    explanation: 'Solve: x+2y=0 and 2x+4y=0. Both equations say x=-2y. So (x,y) = t*(-2,1) or t*(2,-1). This is the null space — direction along which info vanishes. The range is the line t*(1,2) — perpendicular to the null space.',
    ggbHint: 'Type: B={{1,2},{2,4}}. Solve(B*{x,y}={0,0},{x,y}). The null space is perpendicular to the range direction (1,2)!',
    ggbSteps: [
      'Type: B = {{1,2},{2,4}}.',
      'Type: Solve(B*{x,y}={0,0},{x,y}).',
      'GeoGebra shows: x = -2y — null space line!',
      'Type: v = (2,-1) and B*v — get (0,0).',
      'Null space direction (2,-1), range direction (1,2). Perpendicular!'
    ],
    quiz: [
      { q: 'Is the null space direction of [[1,2],[2,4]] given by (2,-1)?', type: 'yesno', correct: 0 },
      { q: 'Is the range direction of [[1,2],[2,4]] given by (1,2)?', type: 'yesno', correct: 0 },
      { q: 'Are the null space and range of a matrix always perpendicular?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '📷', title: 'Data Compression', equation: '', story: 'PCA (Principal Component Analysis) keeps the range directions — the directions where data varies the most — and discards the null space directions where data barely changes. This is like keeping the most informative features of your data while throwing away the noise. The range represents high-variance, high-information directions.', question: 'In PCA data compression, what do the range directions of the transformation represent?', answer: 'high variance directions' },
      { emoji: '🏗️', title: 'Mechanical Engineering', equation: '', story: 'When engineers analyse a mechanical structure, the range of the stiffness matrix represents deformable modes — ways the structure can bend and flex. The null space represents rigid body modes — ways the structure can move as a whole without deforming. Understanding both is essential for predicting how the structure responds to loads.', question: 'In structural analysis, what do the null space modes of the stiffness matrix represent?', answer: 'rigid body modes' },
      { emoji: '📈', title: 'Economics', equation: '', story: 'In an economic input-output model, the range of the production matrix represents achievable outputs — combinations of goods that the economy can produce. The null space represents self-canceling flows — internal transactions that balance out to zero net output. These cancelling flows are economically irrelevant but mathematically present.', question: 'In an economic input-output model, what do the self-canceling flows in the null space represent?', answer: 'null space' },
    ],
    solveExplanation: 'B=[[1,2],[2,4]]: B*(x,y)=(0,0) \u2192 x+2y=0 \u2192 x=-2y. Null space = t(2,-1). Range = t(1,2). They are perpendicular! Rank 1, nullity 1.'
  },
  // Mission 36
  {
    id: 36, emoji: '\uD83C\uDF1F', title: 'Dimension Collapse',
    story: 'Putting it all together: B = [[1,2],[2,4]] maps the 2D plane (\u211D\u00B2) onto a 1D line. The null space (direction (2,-1)) has dimension 1 — all vectors along it vanish. The range (direction (1,2)) has dimension 1 — outputs live here. Rank (dimension of range) = 1, Nullity (dimension of null space) = 1. Rank + Nullity = 2 = dimension of input space! This is the Rank-Nullity Theorem!',
    goal: 'Understand that B collapses a dimension: 2D input \u2192 1D output.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Why does B = [[1,2],[2,4]] "collapse a dimension"?',
    options: null,
    correct: null,
    expectedKeywords: ['maps', '2D', '1D', 'line', 'rank', 'determinant', 'zero', 'dimension', 'lost'],
    explanation: 'det(B)=0 means B is singular. The null space is 1D (vectors along (2,-1) vanish). The range is 1D (line t*(1,2)). So B takes 2D input \u2192 1D output. One dimension collapses! Rank-Nullity: rank(1) + nullity(1) = input dim(2).',
    ggbHint: 'Compute Range of B: B*{1,0} = (1,2). B*{0,1} = (2,4). Both are multiples of (1,2). Range = line t(1,2). Null space = line t(2,-1).',
    ggbSteps: [
      'Type: B = {{1,2},{2,4}}.',
      'Type: B*{1,0} = (1,2) — first basis vector maps to (1,2).',
      'Type: B*{0,1} = (2,4) = 2(1,2) — also on same line!',
      'The two basis vectors both land on the same line t(1,2).',
      'Output has only 1 dimension, not 2. One dimension collapsed!'
    ],
    quiz: [
      { q: 'Is the rank of [[1,2],[2,4]] equal to 1?', type: 'yesno', correct: 0 },
      { q: 'Is the nullity of [[1,2],[2,4]] equal to 1?', type: 'yesno', correct: 0 },
      { q: 'Does rank + nullity always equal the dimension of the input space?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '📷', title: '3D to 2D Photo', equation: '', story: 'Your phone camera takes the full 3D world — with length, width, and depth — and flattens it onto a 2D screen. The depth dimension is lost in this process. This is exactly what a singular matrix does: it collapses one dimension. The null space of the camera\'s projection matrix is the depth direction that vanishes.', question: 'When a camera collapses 3D to 2D, which dimension becomes the null space of the projection?', answer: 'null space of camera' },
      { emoji: '📋', title: 'Data Summary', equation: '', story: 'When you summarise a complex dataset — say, reducing hundreds of survey responses to a single satisfaction score — you are collapsing many dimensions into one. Information is inevitably lost. The dimensions that are discarded form the null space of the summarisation transformation, while the dimension that survives is the range.', question: 'When complex data is reduced to a single summary score, what happens to the information in the discarded dimensions?', answer: 'reducing information' },
      { emoji: '🤖', title: 'Neural Networks', equation: '', story: 'A neural network layer that maps 1000 input features to 10 output neurons must compress the data by 990 dimensions. Those 990 collapsed dimensions form the null space of the layer\'s weight matrix. The network learns to keep the 10 most informative directions (the range) and discard the rest (the null space).', question: 'When a neural network layer maps 1000 inputs to 10 outputs, how many dimensions are collapsed into the null space?', answer: 'null space dimensions' },
    ],
    solveExplanation: 'B: \u211D\u00B2 \u2192 \u211D\u00B2, det=0. Null space = line t(2,-1) (nullity=1). Range = line t(1,2) (rank=1). Rank+Nullity = 1+1 = 2 = dim(input). One dimension collapses!'
  },
  // Mission 37
  {
     id: 37, emoji: '\uD83D\uDD0D', title: 'Four Subspaces Intro',
    story: 'M = [[1,2],[3,6]]. Plot and explain three sets: R = Row Space = span{(1,2),(3,6)} \u2014 linear combos of rows. C = Column Space = span{(1,3),(2,6)} \u2014 linear combos of columns. N = Null Space = {(x,y) | x(1,3)+y(2,6)=0}. Notice: (3,6) = 3(1,2) and (2,6) = 2(1,3) \u2014 both rows and columns are multiples!',
    goal: 'Visualize row space, column space, and null space of a rank-1 matrix.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What are the dimensions of the row space and column space of M = [[1,2],[3,6]]?',
    options: null,
    correct: null,
    expectedKeywords: ['1', '1D', 'line', 'both 1', 'rank 1', 'one-dimensional'],
    explanation: 'M has rank 1 because (3,6)=3(1,2) and (2,6)=2(1,3). Row space = line t(1,2). Column space = line t(1,3). Null space solves x+3y=0 from column equation = line t(-3,1) \u2014 all are 1D! Rank 1, nullity 1.',
    ggbHint: 'Type: M={{1,2},{3,6}}. Compute Det(M)=0. Rows: r1=(1,2), r2=(3,6) \u2014 collinear! Columns: c1=(1,3), c2=(2,6) \u2014 also collinear!',
    ggbSteps: [
      'Type: M = {{1,2},{3,6}} and press Enter.',
      'Type: Determinant(M) \u2014 it is 0!',
      'Rows: (1,2) and (3,6) \u2014 both on line t(1,2)!',
      'Columns: (1,3) and (2,6) \u2014 both on line t(1,3)!',
      'Solve M*{x,y}={0,0} \u2014 null space = line t(-3,1).'
    ],
    quiz: [
      { q: 'Is the rank of [[1,2],[3,6]] equal to 1?', type: 'yesno', correct: 0 },
      { q: 'Is the row space direction of [[1,2],[3,6]] given by (1,2)?', type: 'yesno', correct: 0 },
      { q: 'Are all three fundamental subspaces (row space, column space, null space) 1D lines for a rank-1 2×2 matrix?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '📷', title: 'Image Filter', equation: '', story: 'A rank-1 image filter keeps only one pattern from the original image — like preserving only the brightness variation while discarding all colour and texture information. Because the filter matrix has rank 1, it can only extract one direction of information. Everything else is lost in the null space.', question: 'What does a rank-1 filter preserve from the original image, and what does it discard?', answer: 'one direction' },
      { emoji: '📈', title: 'Single Factor Model', equation: '', story: 'In finance, a single-factor model explains all stock returns using just one underlying factor — like the overall market movement. The covariance matrix of returns has rank 1, meaning all the apparent complexity in stock prices is driven by one common factor. This simplification makes portfolio analysis much more tractable.', question: 'In a single-factor financial model, what does a rank-1 covariance matrix tell us about stock returns?', answer: 'one factor drives all' },
      { emoji: '🏗️', title: 'Simple Lever', equation: '', story: 'A simple lever applies force along one direction only — the line from the fulcrum to the point of application. The mechanical system has rank 1 because it can only transmit force in that single direction. There is no way to push sideways or twist using a simple lever.', question: 'In a simple lever mechanism, why is the system described by a rank-1 matrix?', answer: 'line of action' },
    ],
    solveExplanation: 'M=[[1,2],[3,6]] has det=0, rank=1. Row space = t(1,3), column space = t(1,2), null space = t(-3,1). All 1D!'
  },
  // Mission 38
  {
    id: 38, emoji: '\u2716', title: 'Row Space \u22a5 Null Space',
    story: 'For M = [[1,2],[3,6]], verify that every vector in the row space R is perpendicular to every vector in the null space N. R = line t(1,3), N = line t(-3,1). Compute dot product (1,3)\u00b7(-3,1) and see!',
    goal: 'Verify the Fundamental Theorem for a simple rank-1 matrix.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'Is the dot product of row direction (1,3) and null direction (-3,1) equal to zero?',
    options: null,
    correct: 0,
    explanation: '(1,3)\u00b7(-3,1) = 1\u00b7(-3) + 3\u00b71 = -3 + 3 = 0. The row space and null space are perpendicular lines through origin. This is the Fundamental Theorem for any matrix!',
    ggbHint: 'Type: r=(1,3), n=(-3,1). Compute Dot(r,n) \u2014 result is 0! Plot both vectors \u2014 they look perpendicular.',
    ggbSteps: [
      'Type: r = (1,3) and press Enter.',
      'Type: n = (-3,1) and press Enter.',
      'Type: Dot(r, n) \u2014 GeoGebra shows 0!',
      'The row space and null space are perpendicular.',
      'This holds for EVERY matrix: R(M) \u22a5 N(M).'
    ],
    quiz: [
      { q: 'Is (1,3)·(-3,1) = 0?', type: 'yesno', correct: 0 },
      { q: 'Are R(M) and N(M) always perpendicular subspaces?', type: 'yesno', correct: 0 },
      { q: 'Is the zero vector in both R(M) and N(M)?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🖥️', title: 'Image Processing', equation: '', story: 'In image processing, the useful signal (like edges and shapes) lives in the row space of the transformation matrix, while noise lives in the null space. Because these two subspaces are orthogonal, the signal and noise do not overlap. This orthogonality makes it possible to cleanly separate the signal from the noise by projecting onto the appropriate subspace.', question: 'In image processing, where does the noise typically live relative to the useful signal?', answer: 'null space' },
      { emoji: '📱', title: 'Communications', equation: '', story: 'In wireless communications, different channels are designed to be orthogonal — their signals are perpendicular in the mathematical sense. This means that even though multiple signals share the same airwaves, they never interfere with each other. Your phone call and your neighbour\'s WiFi coexist because their channels are orthogonal.', question: 'Why are orthogonal channels important in wireless communications?', answer: 'non-interfering' },
      { emoji: '🤖', title: 'ML Features', equation: '', story: 'In machine learning, relevant features (like the key factors that predict house prices) live in the row space of the data matrix. Irrelevant features (like the colour of the front door) live in the null space. Because these subspaces are orthogonal, the model can identify and keep only the features that actually matter for prediction.', question: 'In machine learning feature selection, what do the irrelevant features correspond to mathematically?', answer: 'null space features' },
    ],
    solveExplanation: '(1,3)\u00b7(-3,1) = -3+3 = 0. R(M) = t(1,3), N(M) = t(-3,1). They are perpendicular! Fundamental Theorem: R(M) \u22a5 N(M).'
  },
  // Mission 39
  {
     id: 39, emoji: '\uD83D\uDD04', title: 'Null Space of M and M\u1d40',
    story: 'For M = [[1,2],[3,6]], find N(M) and N(M\u1d40). N(M) solves M*(x,y) = (0,0) \u2192 x+2y=0, 3x+6y=0 \u2192 x=-2y \u2192 line t(-2,1). N(M\u1d40) solves M\u1d40*(x,y) = (0,0) where M\u1d40 = [[1,3],[2,6]] \u2192 x+3y=0, 2x+6y=0 \u2192 x=-3y \u2192 line t(-3,1). N(M) is perpendicular to R(M)! N(M\u1d40) is perpendicular to C(M)!',
    goal: 'Find and visualize the null spaces of M and its transpose.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What is N(Mᵀ) for M = [[1,2],[3,6]]? Find the direction of the left null space.',
    options: null,
    correct: null,
    expectedKeywords: ['(-3,1)', '-3,1', 't(-3,1)', 'line', 'perpendicular to column'],
    explanation: 'M\u1d40 = [[1,3],[2,6]]. Solve M\u1d40*(x,y) = (0,0): x+3y=0, 2x+6y=0 \u2192 x=-3y. So N(M\u1d40) = t(-3,1). C(M) = t(1,3). Check orthogonality: (1,3)\u00b7(-3,1) = -3+3 = 0. C(M) \u22a5 N(M\u1d40). Similarly, R(M) = t(1,2), N(M) = t(-2,1). (1,2)\u00b7(-2,1) = -2+2 = 0. R(M) \u22a5 N(M).',
    ggbHint: 'Type: M={{1,2},{3,6}}. Compute MT = Transpose(M) = {{1,3},{2,6}}. Solve(MT*{x,y}={0,0},{x,y}).',
    ggbSteps: [
      'Type: M = {{1,2},{3,6}}.',
      'Type: MT = Transpose(M) = {{1,3},{2,6}}.',
      'Type: Solve(M*{x,y}={0,0},{x,y}) \u2192 N(M) = t(-2,1).',
      'Type: Solve(MT*{x,y}={0,0},{x,y}) \u2192 N(M\u1d40) = t(-3,1).',
      'Check: Dot(column of M, N(M\u1d40)) = 0. Perpendicular!'
    ],
    quiz: [
      { q: 'Is N(M) for [[1,2],[3,6]] the direction (-2,1)?', type: 'yesno', correct: 0 },
      { q: 'Is N(Mᵀ) for [[1,2],[3,6]] the direction (-3,1)?', type: 'yesno', correct: 0 },
      { q: 'Is N(Mᵀ) perpendicular to the column space C(M)?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏗️', title: 'Control Systems', equation: '', story: 'In control engineering, N(M) represents the uncontrollable inputs — disturbances or forces that the controller cannot counteract. N(Mᵀ) represents the unobservable outputs — aspects of the system that the sensors cannot detect. Understanding both null spaces is critical for designing a controller that can actually manage the system.', question: 'In control theory, what does the null space of the transpose matrix N(Mᵀ) represent?', answer: 'unobservable outputs' },
      { emoji: '📊', title: 'Statistics', equation: '', story: 'In regression analysis, N(M) contains the redundant predictors — variables that are linear combinations of others and provide no new information. N(Mᵀ) contains the unmeasurable responses — outcomes that cannot be predicted from the available data. Identifying these null spaces helps statisticians build cleaner, more interpretable models.', question: 'In regression analysis, what does the null space N(M) of the design matrix represent?', answer: 'redundant predictors' },
      { emoji: '📱', title: 'Coding Theory', equation: '', story: 'Error-correcting codes use the null space of a parity-check matrix to define valid codewords. N(Mᵀ) helps detect errors — if a received message is not orthogonal to the expected pattern, an error has occurred. This is how QR codes and digital communications detect and correct transmission errors.', question: 'In error-correcting codes, what does the null space of the transpose matrix help detect?', answer: 'errors' },
    ],
    solveExplanation: 'M=[[1,2],[3,6]] has rank 1. N(M)=t(-2,1), N(M\u1d40)=t(-3,1). C(M)=t(1,3) is perpendicular to N(M\u1d40). R(M)=t(1,2) is perpendicular to N(M).'
  },
  // Mission 40
  {
     id: 40, emoji: '\uD83C\uDF31', title: 'Orthogonal Subspaces',
    story: 'The four fundamental subspaces for any matrix M satisfy: C(M) \u22a5 N(M\u1d40) and R(M) \u22a5 N(M). Verify these for M = [[1,2],[3,6]]: C(M)=t(1,3), N(M\u1d40)=t(-3,1) \u2014 dot = -3+3 = 0. R(M)=t(1,2), N(M)=t(-2,1) \u2014 dot = -2+2 = 0. Both pairs confirmed orthogonal!',
    goal: 'Verify the four subspace orthogonal relationships.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'Are columns of M always perpendicular to the null space of Mᵀ (C(M) ⊥ N(Mᵀ))?',
    options: null,
    correct: 0,
    explanation: 'For M=[[1,2],[3,6]]: C(M)=t(1,3), N(M\u1d40)=t(-3,1). Dot = (1,3)\u00b7(-3,1) = -3+3=0. And R(M)=t(1,2), N(M)=t(-2,1). Dot = (1,2)\u00b7(-2,1) = -2+2=0. Both orthogonal pairs confirmed!',
    ggbHint: 'Type columns: c1=(1,3), c2=(2,6). They are collinear. Type nMT = (-3,1). Dot(c1, nMT)=0! Then check R(M) \u22a5 N(M).',
    ggbSteps: [
      'Type: c = (1,3) \u2014 column direction of M.',
      'Type: nMT = (-3,1) \u2014 N(M\u1d40) direction.',
      'Type: Dot(c, nMT) \u2014 equals 0! C(M) \u22a5 N(M\u1d40).',
      'Type: r = (1,2) \u2014 row direction of M.',
      'Type: nM = (-2,1) \u2014 N(M) direction. Dot(r, nM)=0! R(M) \u22a5 N(M).'
    ],
    quiz: [
      { q: 'Is C(M) perpendicular to N(Mᵀ) (left null space)?', type: 'yesno', correct: 0 },
      { q: 'Is R(M) perpendicular to N(M) (null space)?', type: 'yesno', correct: 0 },
      { q: 'Do the four subspaces always form exactly two orthogonal pairs?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏆', title: 'Signal Processing', equation: '', story: 'In signal processing, the four fundamental subspaces each play a specific role. The row space carries the signal, the null space carries the noise, the column space represents what can be measured, and the left null space represents measurement ambiguity. Understanding all four allows engineers to design systems that cleanly separate signal from noise.', question: 'In the four-subspace framework of signal processing, which subspace contains the useful signal?', answer: 'row space' },
      { emoji: '🏗️', title: 'Structural Engineering', equation: '', story: 'When analysing a structure under load, forces that can be applied (column space) and the rigid body motions that cannot be resisted (left null space) are orthogonal. This means the structure can freely move in certain directions without any internal stress. The orthogonality between these subspaces is fundamental to understanding structural equilibrium.', question: 'In structural analysis, which subspace contains the rigid body motions that produce no internal stress?', answer: 'N(Mᵀ)' },
      { emoji: '📈', title: 'Econometrics', equation: '', story: 'In econometric models, instrumental variables (row space) must be orthogonal to the error terms (null space). If they are not orthogonal, the estimates will be biased. This orthogonality condition — R(M) ⊥ N(M) — is not just a mathematical curiosity; it is a practical requirement for getting trustworthy economic estimates.', question: 'In econometrics, what must the instrumental variables be orthogonal to for unbiased estimates?', answer: 'errors (N)' },
    ],
    solveExplanation: 'Four subspaces: C(M) \u22a5 N(M\u1d40) and R(M) \u22a5 N(M). M=[[1,2],[3,6]]: C(M)=t(1,3)\u22a5t(-3,1)=N(M\u1d40). R(M)=t(1,2)\u22a5t(-2,1)=N(M).'
  },
  // Mission 41
  {
    id: 41, emoji: '\uD83D\uDCCA', title: 'All Four of A',
     story: 'A = [[1,4,7],[2,5,8],[3,6,9]]. Find and visualize all four fundamental subspaces: N(A), C(A), R(A), N(A\u1d40). A has rank 2. N(A) = t(1,-2,1) (line). R(A) and C(A) are planes. N(A\u1d40) = t(1,-2,1) as well \u2014 both null spaces are the same line! R(A) \u22a5 N(A) and C(A) \u22a5 N(A\u1d40). Rank-nullity: rank(2) + nullity(1) = dim(3).',

    goal: 'Visualize all four fundamental subspaces of a 3\u00d73 rank-2 matrix.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What is the dimension of N(Aᵀ) for A = [[1,4,7],[2,5,8],[3,6,9]]?',
    options: null,
    correct: null,
    expectedKeywords: ['1', '1D', 'line', 'one-dimensional'],
    explanation: 'A\u1d40 = [[1,2,3],[4,5,6],[7,8,9]] has rank 2, nullity 1. N(A\u1d40) = t(1,-2,1). The four subspaces: R(A)=plane (span of rows), C(A)=plane (span of columns), N(A)=line t(1,-2,1), N(A\u1d40)=line t(1,-2,1). R(A) \u22a5 N(A) and C(A) \u22a5 N(A\u1d40). Rank-nullity: rank=2, nullity=1, dim=3.',
    ggbHint: 'Type: A={{1,4,7},{2,5,8},{3,6,9}}. Compute rank with Rank(A)=2. NullSpace(A) and NullSpace(Transpose(A)).',
    ggbSteps: [
      'Type: A = {{1,4,7},{2,5,8},{3,6,9}}.',
      'Type: Rank(A) \u2014 shows 2.',
      'Type: Solve(A*{x,y,z}={0,0,0},{x,y,z}) \u2192 N(A).',
      'Type: AT = Transpose(A). Solve(AT*{x,y,z}={0,0,0}) \u2192 N(A\u1d40).',
      'Both null spaces are lines in 3D through the origin.'
    ],
    quiz: [
      { q: 'Is the rank of A = [[1,4,7],[2,5,8],[3,6,9]] equal to 2?', type: 'yesno', correct: 0 },
      { q: 'Is the N(A) direction of [[1,4,7],[2,5,8],[3,6,9]] given by (1,-2,1)?', type: 'yesno', correct: 0 },
      { q: 'Are all four subspaces of this 3×3 rank-2 matrix either 1D lines or 2D planes?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏗️', title: 'Circuit Analysis', equation: '', story: 'Kirchhoff\'s voltage law states that the sum of voltages around any loop in a circuit is zero. These loop equations form the row space of the circuit matrix. The currents that satisfy all loop equations simultaneously live in the null space. Understanding both subspaces allows engineers to solve for all currents and voltages in complex circuits.', question: 'In circuit analysis, what do the loop equations from Kirchhoff\'s voltage law correspond to?', answer: 'row space' },
      { emoji: '📱', title: 'Networks', equation: '', story: 'A communication network has inputs (data sent) and outputs (data received). The four subspaces of the network\'s routing matrix describe the input-output relationships: which inputs can reach which outputs, which inputs are redundant, and which outputs are unreachable. Network designers use this to optimise data flow.', question: 'In a communication network, what does the column space of the routing matrix represent?', answer: 'reachable outputs' },
      { emoji: '📈', title: 'Portfolio Theory', equation: '', story: 'In portfolio theory, the row space represents return factors that drive asset prices. The null space contains risk-free combinations — portfolios that have zero variance and guaranteed returns. The column space shows achievable returns, and the left null space reveals pricing kernels used to value derivatives.', question: 'In portfolio theory, what does the null space of the return matrix represent?', answer: 'risk-free combinations' },
    ],
    solveExplanation: 'A=[[1,4,7],[2,5,8],[3,6,9]], rank=2. R(A)=plane, C(A)=plane, N(A)=t(1,-2,1), N(A\u1d40)=t(1,-2,1). R(A)\u22a5N(A), C(A)\u22a5N(A\u1d40).'
  },
  // Mission 42
  {
    id: 42, emoji: '\uD83D\uDCCB', title: 'Rank by Example',
    story: 'Consider M : \u211D\u2074 \u2192 \u211D\u2074, a 4\u00d74 matrix. Give one example matrix for each case: (a) rank 4, (b) rank 3, (c) rank 2, (d) rank 1, (e) rank 0. For each, verify its rank in GeoGebra and explain why the range has that dimension.',
    goal: 'Build 4\u00d74 matrices of every possible rank and understand range dimension.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Type a 4\u00d74 matrix M in GeoGebra and compute Rank(M). What rank does M = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,0]] have?',
    expectedKeywords: ['3', 'rank 3'],
    explanation: 'That matrix has 3 pivots \u2192 rank 3. The range (column space) is 3D. For rank 4: identity I_4. Rank 2: put 1s in first two diagonal entries, zeros elsewhere. Rank 1: put 1 at (1,1), zeros elsewhere. Rank 0: zero matrix. The rank always equals the dimension of the range!',
    ggbHint: 'Type: M1=Identity(4) for rank 4. M2={{1,0,0,0},{0,1,0,0},{0,0,0,0},{0,0,0,0}} for rank 2. Use Rank(M) to verify.',
    ggbSteps: [
      'Type: I = Identity(4) \u2014 rank 4, range = whole \u211D\u2074.',
      'Type: M3 = {{1,0,0,0},{0,1,0,0},{0,0,1,0},{0,0,0,0}} \u2014 rank 3.',
      'Type: M2 = {{1,0,0,0},{0,1,0,0},{0,0,0,0},{0,0,0,0}} \u2014 rank 2.',
      'Type: M1 = {{1,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0}} \u2014 rank 1.',
      'Type: Z = {{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0}} \u2014 rank 0.'
    ],
    quiz: [
      { q: 'Does Identity(4) have full rank (rank 4)?', type: 'yesno', correct: 0 },
      { q: 'Is the rank of the zero 4×4 matrix equal to 0?', type: 'yesno', correct: 0 },
      { q: 'Does rank always equal the dimension of the range (column space)?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏗️', title: 'Mechanical Systems', equation: '', story: 'In a mechanical system with multiple joints and linkages, the rank of the system matrix tells you the number of independent degrees of freedom — how many different ways the mechanism can move. A rank-4 system can move in 4 independent directions, while a rank-1 system is essentially locked into one type of motion.', question: 'In a mechanical system, what does a rank-4 system matrix tell you about the mechanism\'s movement?', answer: '4 DOF' },
      { emoji: '📈', title: 'Data Science', equation: '', story: 'When you have a dataset with many columns (features), the rank of the data matrix tells you how many truly independent features exist. If you have 10 columns but rank 3, then 7 of those columns are redundant — they can be expressed as combinations of the other 3. The rank reveals the true dimensionality of your data.', question: 'In a dataset with many columns, what does the rank of the data matrix reveal?', answer: 'independent features' },
      { emoji: '🌍', title: 'Networks', equation: '', story: 'The adjacency matrix of a network (like a social network or road network) has a rank that tells you about the network\'s connectivity. A rank-0 adjacency matrix means all entries are zero — no connections exist between nodes. Higher rank means more independent connection patterns exist in the network.', question: 'What does a rank-0 adjacency matrix tell you about a network?', answer: 'disconnected nodes' },
    ],
    solveExplanation: 'Rank = dim(range). Rank 4: I_4. Rank 3: diag(1,1,1,0). Rank 2: diag(1,1,0,0). Rank 1: diag(1,0,0,0). Rank 0: zero matrix. Range dimension = rank!'
  },
  // Mission 43
  {
    id: 43, emoji: '\uD83D\uDCC8', title: 'Range Contains Line',
    story: 'If a linear transformation A : \u211D\u00B3 \u2192 \u211D\u00B3 has a point (a,b,c) in its range, then it also contains the entire line S = { \u03b1(a,b,c) | \u03b1 \u2208 \u211D }. Why? Because A(\u03b1x) = \u03b1A(x) = \u03b1(a,b,c). Since A is linear, scaling the input scales the output. So the range is always a subspace \u2014 closed under scaling!',
    goal: 'Prove that the range contains the entire line through any point in it.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'If the vector (2,4,6) is in the range of A, must all scalar multiples α(2,4,6) also be in the range?',
    options: null,
    correct: 0,
    explanation: 'If (a,b,c) = A(x), then for any \u03b1, A(\u03b1x) = \u03b1A(x) = \u03b1(a,b,c). So the entire line { \u03b1(a,b,c) } is contained in the range. This shows the range is a subspace \u2014 closed under scalar multiplication.',
    ggbHint: 'Pick a matrix, e.g. A={{1,0,0},{0,1,0},{0,0,1}}. Then A*(1,2,3) = (1,2,3). Now compute A*(2,4,6) = 2(1,2,3).',
    ggbSteps: [
      'Type: A = {{1,0,0},{0,1,0},{0,0,1}}.',
      'Type: A*{1,2,3} \u2192 (1,2,3) in range.',
      'Type: A*(2*{1,2,3}) = A*{2,4,6} \u2192 (2,4,6) = 2(1,2,3).',
      'The whole line \u03b1(1,2,3) is in the range.',
      'Any subspace is closed under scaling!'
    ],
    quiz: [
      { q: 'If v is in the range of A, is 5v also in the range?', type: 'yesno', correct: 0 },
      { q: 'Is the range of a linear map always a subspace (closed under addition and scaling)?', type: 'yesno', correct: 0 },
      { q: 'Does the property A(αx) = αA(x) (homogeneity) guarantee the range contains scalar multiples?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '🏗️', title: 'Amplifier', equation: '', story: 'An audio amplifier takes an input signal and produces a larger output. If you double the input volume, the output also doubles — the amplifier is a linear system. This scaling property means the output is always proportional to the input, which is why amplifiers produce clean, undistorted sound at moderate volumes.', question: 'In a linear amplifier, what happens to the output when you double the input voltage?', answer: 'double output' },
      { emoji: '📷', title: 'Zoom', equation: '', story: 'When you zoom in on a digital image, every coordinate is multiplied by the same scale factor. If you zoom in by 2x, every point moves twice as far from the origin. This uniform scaling is a linear transformation — it preserves straight lines and the proportional relationships between points.', question: 'When you zoom in on an image, what happens to all the coordinates mathematically?', answer: 'multiply all coordinates' },
      { emoji: '📈', title: 'Economics', equation: '', story: 'In a linear production model, doubling all inputs (labour, materials, energy) exactly doubles all outputs. This is the scaling property of linear systems. It means the production function has constant returns to scale — a useful simplification for economic modelling, even if real production sometimes has diminishing returns.', question: 'In a linear production model, what happens to outputs when all inputs are doubled?', answer: 'scaling property' },
    ],
    solveExplanation: 'If (a,b,c) = A(x) is in range, then A(\u03b1x) = \u03b1A(x) = \u03b1(a,b,c). So the whole line through (a,b,c) is in range. Range is always a subspace!'
  },
  // Mission 44
  {
    id: 44, emoji: '\uD83D\uDDFA\uFE0F', title: 'Range Contains Span',
    story: 'Continuing from Q7: if the range contains points (a,b,c) and (d,e,f), then it also contains T = { \u03b1(a,b,c) + \u03b2(d,e,f) | \u03b1,\u03b2 \u2208 \u211D }. This is because if (a,b,c) = A(x) and (d,e,f) = A(y), then A(\u03b1x+\u03b2y) = \u03b1A(x) + \u03b2A(y) = \u03b1(a,b,c) + \u03b2(d,e,f). The range is closed under addition and scaling \u2014 a subspace!',
    goal: 'Prove that the range contains the span of any two vectors in it.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'If (1,0,0) and (0,1,0) are both in the range of A, what larger set must also be in the range?',
    options: null,
    correct: null,
    expectedKeywords: ['plane', 'span', 'combination', 'linear', 'xy-plane', 'all of', 'every'],
    explanation: 'If (1,0,0)=A(x) and (0,1,0)=A(y), then for any \u03b1,\u03b2: A(\u03b1x+\u03b2y) = \u03b1(1,0,0)+\u03b2(0,1,0). So the entire span (the xy-plane) is contained in the range. The range is always a subspace \u2014 closed under linear combinations!',
    ggbHint: 'Use a matrix whose range you know, e.g. A={{1,0,0},{0,1,0},{0,0,0}}. Range is the xy-plane. Pick any two points and take combinations.',
    ggbSteps: [
      'Type: A = {{1,0,0},{0,1,0},{0,0,0}} \u2014 range = xy-plane.',
      'Type: A*{1,0,0} = (1,0,0) \u2014 in range.',
      'Type: A*{0,1,0} = (0,1,0) \u2014 also in range.',
      'Type: A*(2*{1,0,0} + 3*{0,1,0}) = A*{2,3,0} = (2,3,0) \u2014 also in range!',
      'Any combination \u03b1(1,0,0)+\u03b2(0,1,0) is in range.'
    ],
    quiz: [
      { q: 'If v and w are in the range of A, is v + w also in the range?', type: 'yesno', correct: 0 },
      { q: 'Is the span of two linearly independent vectors in R³ a plane (2D)?', type: 'yesno', correct: 0 },
      { q: 'Does the property A(x+y) = A(x)+A(y) (additivity) guarantee the range contains sums?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '🌈', title: 'Color Mixing', equation: '', story: 'If you can produce pure red light and pure blue light, then you can produce any shade of purple by mixing them in different proportions. The span of red and blue gives you the entire purple colour gamut. This is the spanning property of linear systems — any combination of achievable outputs is also achievable.', question: 'If red and blue are achievable colours, what does their span represent in terms of achievable colours?', answer: 'span of colors' },
      { emoji: '🎵', title: 'Sound Synthesis', equation: '', story: 'If a synthesiser can produce two pure tones (sine waves at different frequencies), it can produce any weighted combination of those tones. By adjusting the volume of each tone, you create complex sounds. The span of the two base frequencies gives you an entire family of possible sounds.', question: 'When two sound frequencies can be combined in any proportion, what mathematical concept describes the set of all possible sounds?', answer: 'linear combination' },
      { emoji: '🎨', title: 'Graphics', equation: '', story: 'In computer graphics, if a display can produce three basis colours (red, green, blue), then any colour in their span can be rendered on screen. The entire visible colour gamut of the display is the span of these three basis vectors. Mixing them in different proportions creates millions of colours.', question: 'What mathematical concept describes the full range of colours a display can produce from its RGB basis?', answer: 'span of basis colors' },
    ],
    solveExplanation: 'If v=A(x), w=A(y) in range, then A(\u03b1x+\u03b2y) = \u03b1v+\u03b2w. So span{v,w} \u2286 range. Range is a subspace \u2014 closed under linear combinations!'
  },
  // Mission 45
  {
    id: 45, emoji: '\uD83C\uDF93', title: 'Dimension Observation',
    story: 'S = { \u03b1(a,b,c) } always has dimension 1 \u2014 it is a line through the origin. But T = { \u03b1(a,b,c) + \u03b2(d,e,f) } does NOT always have dimension 2. If (a,b,c) and (d,e,f) are linearly dependent (one is a multiple of the other), T is just a line (dim 1). Show both cases in GeoGebra: (i) T is a plane (dim 2) when vectors are independent, (ii) T is a line (dim 1) when they are dependent.',
    goal: 'Understand that span dimension depends on linear independence.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What is the dimension of T = span{(1,2,3), (2,4,6)}? Explain why.',
    options: null,
    correct: null,
    expectedKeywords: ['1', 'dependent', 'multiple', 'collinear', 'same line', '1D'],
    explanation: '(2,4,6) = 2(1,2,3), so the two vectors are linearly dependent. T = span{(1,2,3)} = line (dim 1). For a plane (dim 2), you need two linearly independent vectors like (1,0,0) and (0,1,0). The dimension of a span equals the number of linearly independent vectors.',
    ggbHint: 'Plot v=(1,2,3) and w=(2,4,6). They lie on the same line through origin. Now plot v=(1,0,0) and w=(0,1,0) \u2014 they define a plane.',
    ggbSteps: [
      'Type: v = (1,2,3), w = (2,4,6).',
      'Plot both \u2014 they are collinear! span is 1D line.',
      'Now type: v2 = (1,0,0), w2 = (0,1,0).',
      'Plot both \u2014 they define the xy-plane! span is 2D.',
      'Dimension of span = number of linearly independent vectors.'
    ],
    quiz: [
      { q: 'Are (1,2,3) and (2,4,6) linearly independent?', type: 'yesno', correct: 1 },
      { q: 'Are (1,0,0) and (0,1,0) linearly independent?', type: 'yesno', correct: 0 },
      { q: 'Is the dimension of the span of two linearly dependent vectors equal to 1 (a line)?', type: 'yesno', correct: 0 },
    ],
    realLife: [
      { emoji: '🏗️', title: 'Redundant Sensors', equation: '', story: 'Imagine two temperature sensors in a room that always give the same reading because they are placed right next to each other. These two sensors are linearly dependent — one provides no information beyond what the other already tells you. Only one independent measurement exists, even though you have two sensors. The second sensor is redundant.', question: 'When two sensors always give the same reading, what does this mean in terms of linear independence?', answer: 'redundant info' },
      { emoji: '📊', title: 'Survey Questions', equation: '', story: 'In a customer satisfaction survey, if two questions always receive the same answers (like "How satisfied are you?" and "How happy are you?"), they are linearly dependent. One question adds no new information. A good survey avoids dependent questions to keep the questionnaire short while capturing maximum information.', question: 'When two survey questions always get the same answers, what mathematical relationship exists between them?', answer: 'same info' },
      { emoji: '🎵', title: 'Music', equation: '', story: 'When two instruments play the exact same note in unison, their sound waves are identical — they are linearly dependent. You cannot distinguish one from the other by listening. Only one independent sound exists, even though two instruments are playing. To hear two different notes, the instruments must play different (independent) frequencies.', question: 'When two instruments play the same note in unison, what is their mathematical relationship?', answer: 'linearly dependent' },
    ],
    solveExplanation: 'S = \u03b1(a,b,c) always has dim 1. T = span{v,w}: if w = cv (dependent) then dim=1; if independent then dim=2. Dimension = number of linearly independent vectors!'
  },
  // Mission 46
  {
    id: 46, emoji: '\uD83D\uDD0D', title: 'The Big Picture',
    story: 'For ANY matrix A (size m\u00d7n), four subspaces define its behavior: R(A) = Row Space = span of rows (in \u211D\u207F). C(A) = Column Space = span of columns (in \u211D\u1D40). N(A) = Null Space = {x | Ax=0} (in \u211D\u207F). N(A\u1d40) = Left Null Space = {y | A\u1d40y=0} (in \u211D\u1D40). Review with A = [[1,2],[3,6]]: R(A) = t(1,3), C(A) = t(1,2), N(A) = t(-2,1), N(A\u1d40) = t(-3,1).',
    goal: 'See the complete map of the four fundamental subspaces.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'For A = [[1,2],[3,6]], which two subspaces live in the input space Rⁿ?',
    options: null,
    correct: null,
    expectedKeywords: ['R(A)', 'N(A)', 'row space', 'null space', 'row', 'null'],
    explanation: 'R(A) \u2282 \u211D\u207F (input space) and N(A) \u2282 \u211D\u207F (input space). C(A) \u2282 \u211D\u1D40 (output space) and N(A\u1d40) \u2282 \u211D\u1D40 (output space). R(A) and N(A) are perpendicular subspaces of \u211D\u207F. C(A) and N(A\u1d40) are perpendicular subspaces of \u211D\u1D40. Together they form the complete picture!',
    ggbHint: 'For any matrix A, use GeoGebra to find: NullSpace(A) gives N(A). NullSpace(Transpose(A)) gives N(A\u1d40). Rank(A) gives dimension of R(A) and C(A).',
    ggbSteps: [
      'Type: A = {{1,2},{3,6}}.',
      'Type: Rank(A) = 1 \u2014 R(A) and C(A) are 1D.',
      'Type: N(A) = t(-2,1) \u2014 line in input space.',
      'Type: N(A\u1d40) = t(-3,1) \u2014 line in output space.',
      'R(A) \u22a5 N(A) in input space, C(A) \u22a5 N(A\u1d40) in output space.'
    ],
    quiz: [
      { q: 'Do R(A) and N(A) live in the input space (domain) of A?', type: 'yesno', correct: 0 },
      { q: 'Do C(A) and N(Aᵀ) live in the output space (codomain) of A?', type: 'yesno', correct: 0 },
      { q: 'Do R(A) and N(A) together span the entire input space?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏗️', title: 'System Design', equation: '', story: 'When designing an engineering system, the inputs can be decomposed into two parts: the controllable components (row space) that your design can influence, and the uncontrollable components (null space) that are beyond your reach. A good design maximises the row space — making as many inputs controllable as possible — while minimising the null space.', question: 'In system design, which subspace contains the inputs that your design can actually control?', answer: 'row space' },
      { emoji: '📱', title: 'Communications', equation: '', story: 'When a signal is transmitted through a communication channel, the output received is a mixture of the actual signal (column space) and unavoidable noise (left null space). The receiver must separate these two components to extract the original message. The orthogonality between column space and left null space makes this separation possible.', question: 'At the receiver end of a communication channel, which subspace contains the useful signal?', answer: 'column space' },
      { emoji: '📈', title: 'Data Science', equation: '', story: 'PCA (Principal Component Analysis) decomposes your data into signal (the row space — high-variance directions worth keeping) and noise (the null space — low-variance directions to discard). This decomposition is the practical application of the four-subspace framework: keep what matters, discard what does not.', question: 'In PCA, which subspace contains the noise and redundant information that should be discarded?', answer: 'null space' },
    ],
    solveExplanation: 'Four subspaces: R(A), N(A) in input space \u211D\u207F; C(A), N(A\u1d40) in output space \u211D\u1D40. R \u22a5 N and C \u22a5 N\u1d40. Dimensions: rank + nullity = n.'
  },
  // Mission 47
  {
    id: 47, emoji: '\u2716', title: 'Orthogonality Checkup',
    story: 'Verify all orthogonal relationships for A = [[1,4,7],[2,5,8],[3,6,9]] using GeoGebra. Check: (i) R(A) \u22a5 N(A) \u2014 dot product of every row with every null vector = 0. (ii) C(A) \u22a5 N(A\u1d40) \u2014 dot product of every column with every left null vector = 0. These are not optional \u2014 they always hold for ANY matrix!',
    goal: 'Verify the two orthogonal pairs for a 3\u00d73 rank-2 matrix.',
    ggbType: 'graphing',
    answerType: 'yesno',
    prompt: 'Is the dot product (1,4,7)·(1,-2,1) equal to zero, confirming the row space is perpendicular to the null space?',
    options: null,
    correct: 0,
    explanation: '(1,4,7)\u00b7(1,-2,1) = 1-8+7 = 0. (2,5,8)\u00b7(1,-2,1) = 2-10+8 = 0. R(A) \u22a5 N(A). Similarly, columns (1,2,3)\u00b7(1,-2,1) = 1-4+3 = 0. C(A) \u22a5 N(A\u1d40). These always hold!',
    ggbHint: 'Type rows: r1=(1,4,7), r2=(2,5,8). Type null direction n=(1,-2,1). Dot(r1,n) and Dot(r2,n) both = 0.',
    ggbSteps: [
      'Type: r1=(1,4,7), r2=(2,5,8) \u2014 rows of A.',
      'Type: c1=(1,2,3), c2=(4,5,6) \u2014 columns of A.',
      'Type: n=(1,-2,1) \u2014 N(A) and N(A\u1d40) direction.',
      'Type: Dot(r1,n) = 0, Dot(r2,n) = 0 \u2014 R(A) \u22a5 N(A).',
      'Type: Dot(c1,n) = 0, Dot(c2,n) = 0 \u2014 C(A) \u22a5 N(A\u1d40).'
    ],
    quiz: [
      { q: 'Is (1,4,7)·(1,-2,1) = 0?', type: 'yesno', correct: 0 },
      { q: 'Is (4,5,6)·(1,-2,1) = 0?', type: 'yesno', correct: 0 },
      { q: 'Are these two orthogonal pairs always true for any matrix?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🛡️', title: 'Image Restoration', equation: '', story: 'When restoring a degraded image, the clean signal lives in the row space of the degradation matrix, and the noise lives in the null space. Because these subspaces are orthogonal (perpendicular), they do not overlap. This orthogonality is what makes it mathematically possible to separate the signal from the noise and restore the original image.', question: 'When signal and noise are in orthogonal subspaces, what does this mean for image restoration?', answer: 'independent components' },
      { emoji: '📱', title: 'Wireless Channels', equation: '', story: 'Modern wireless standards like WiFi 6 and 5G use orthogonal frequency channels to carry data. Because the channels are perpendicular (dot product = 0), multiple data streams can share the same airwaves without interfering. Your phone can download a file while streaming music because the channels are mathematically independent.', question: 'Why are orthogonal frequency channels critical for modern wireless communications?', answer: 'no interference' },
      { emoji: '🤖', title: 'AI Features', equation: '', story: 'In modern AI, feature representations are designed to be orthogonal — each feature captures an independent aspect of the data. For example, in face recognition, one feature might encode face shape while another encodes skin tone. Orthogonality ensures these features do not redundantly capture the same information.', question: 'When AI features are orthogonal to each other, what does this tell us about the information they capture?', answer: 'independent information' },
    ],
    solveExplanation: 'R(A) \u22a5 N(A): every row dot every null vector = 0. C(A) \u22a5 N(A\u1d40): every column dot every left null vector = 0. Always true for any matrix!'
  },
  // Mission 48
  {
    id: 48, emoji: '\uD83D\uDCCA', title: 'Rank-Nullity Review',
    story: 'The Rank-Nullity Theorem: For A : \u211D\u207F \u2192 \u211D\u1D40, rank(A) + nullity(A) = n (number of columns). Verify for different matrices: A=[[1,0],[0,1]] \u2192 rank=2, nullity=0, n=2. B=[[1,2],[2,4]] \u2192 rank=1, nullity=1, n=2. C=[[1,2,3],[4,5,6],[7,8,9]] \u2192 rank=2, nullity=1, n=3. Always rank + nullity = number of columns!',
    goal: 'Verify the Rank-Nullity Theorem for different examples.',
    ggbType: 'graphing',
    answerType: 'num',
    prompt: 'For A = [[1,2,3],[4,5,6],[7,8,9]], what is nullity(A) = n - rank(A)? (n = 3)',
    correct: 1,
    tolerance: 0,
    explanation: 'Rank(A) = 2 (since row3 = row2 - row1). Nullity = n - rank = 3 - 2 = 1. This matches: N(A) = t(1,-2,1) which is a 1D line. Rank + Nullity = 2 + 1 = 3 = n. Verified!',
    ggbHint: 'Type: A={{1,2,3},{4,5,6},{7,8,9}}. Compute Rank(A). Subtract from number of columns to get nullity.',
    ggbSteps: [
      'Type: A = {{1,2,3},{4,5,6},{7,8,9}}.',
      'Type: Rank(A) \u2014 shows 2.',
      'Nullity = 3 - rank = 1. Verify with N(A) = t(1,-2,1).',
      'Now test: B={{1,2},{2,4}}. Rank(B)=1, nullity=2-1=1.',
      'Rank + Nullity = number of columns. Always!'
    ],
    quiz: [
      { q: 'Does Rank + Nullity always equal the number of columns (n)?', type: 'yesno', correct: 0 },
      { q: 'Is rank + nullity = 2 for B = [[1,2],[2,4]]?', type: 'yesno', correct: 0 },
      { q: 'Does rank + nullity always equal the number of columns?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏗️', title: 'Degrees of Freedom', equation: '', story: 'In a mechanical system, the rank tells you the number of independent degrees of freedom — how many ways the system can move. The nullity tells you the number of redundant constraints — equations that do not add new information. Together, rank + nullity equals the total number of variables, giving you the complete picture of the system\'s freedom.', question: 'In a mechanical system, what does the nullity (dimension of the null space) represent?', answer: 'redundancies' },
      { emoji: '📊', title: 'Statistics', equation: '', story: 'In regression analysis, the rank of the design matrix tells you how many independent predictors you actually have. The nullity tells you how many predictors are collinear — they are redundant because they can be expressed as combinations of others. A good model keeps the rank high and the nullity low.', question: 'In regression, what do collinear predictors correspond to in terms of the null space?', answer: 'null space' },
      { emoji: '📱', title: 'Coding Theory', equation: '', story: 'In error-correcting codes, the rank of the generator matrix tells you how many independent message bits can be encoded. The nullity tells you how many parity check bits are added for error detection. The balance between rank and nullity determines the code\'s ability to detect and correct errors.', question: 'In error-correcting codes, what do the parity check bits correspond to in terms of rank and nullity?', answer: 'nullity' },
    ],
    solveExplanation: 'Rank-Nullity: rank(A) + nullity(A) = n (columns). A=[[1,2,3],[4,5,6],[7,8,9]]: rank=2, nullity=1, n=3. Always check with GeoGebra!'
  },
  // Mission 49
  {
    id: 49, emoji: '\uD83C\uDFC6', title: 'Capstone Challenge',
    story: 'Given M = [[2,4],[1,2],[3,6]] (3\u00d72 matrix). Find ALL four subspaces using GeoGebra: R(M), C(M), N(M), N(M\u1d40). What are their dimensions? How are they related? Hint: M has rank 1 (all rows are multiples of (1,2), all columns are multiples of (2,1,3)\u1d40).',
    goal: 'Apply the full four-subspace analysis to a new matrix.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What is the dimension of N(M) for M = [[2,4],[1,2],[3,6]]? (3×2 matrix with rank 1)',
    options: null,
    correct: null,
    expectedKeywords: ['1', '1D', 'line', 'one-dimensional', 'nullity'],
    explanation: 'M is 3\u00d72, rank 1 (all rows multiples of (1,2)). Nullity = n - rank = 2 - 1 = 1. N(M) = t(-2,1). R(M) = t(1,2) in \u211D\u00B2. C(M) = t(2,1,3) in \u211D\u00B3. N(M\u1d40) = solutions to M\u1d40y=0 \u2014 a plane in \u211D\u00B3 (dimension 2). Check: C(M) \u22a5 N(M\u1d40) and R(M) \u22a5 N(M).',
    ggbHint: 'Type: M={{2,4},{1,2},{3,6}}. Rank(M)=1. Solve(M*{x,y}={0,0}) for N(M). Solve(Transpose(M)*{x,y,z}={0,0,0}) for N(M\u1d40).',
    ggbSteps: [
      'Type: M = {{2,4},{1,2},{3,6}}.',
      'Type: Rank(M) \u2014 it is 1.',
      'Type: Solve(M*{x,y}={0,0},{x,y}) \u2192 N(M) = t(-2,1).',
      'Type: MT = Transpose(M). Solve(MT*{x,y,z}={0,0,0}) \u2192 N(M\u1d40) = plane.',
      'R(M) = t(1,2) in \u211D\u00B2, C(M) = t(2,1,3) in \u211D\u00B3, N(M) = t(-2,1), N(M\u1d40) = plane.'
    ],
    quiz: [
      { q: 'Is the rank of a 3×2 matrix with all rows collinear equal to 1?', type: 'yesno', correct: 0 },
      { q: 'Does R(M) live in the input space (R² for a 2-column matrix)?', type: 'yesno', correct: 0 },
      { q: 'Is C(M) a line in R³ for this rank-1 matrix?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏗️', title: 'Engineering Systems', equation: '', story: 'When a system has 3 sensors but only 2 independent variables to measure, the third sensor is redundant — its reading can be predicted from the other two. The system matrix has rank 2 (two independent measurements) and nullity 1 (one redundant sensor). The redundant sensor adds a dependent row that does not increase the rank.', question: 'When 3 sensors measure only 2 independent variables, what does the redundant sensor represent in matrix terms?', answer: 'dependent row' },
      { emoji: '📊', title: 'Survey Analysis', equation: '', story: 'A survey with 3 questions but only 1 underlying trait being measured produces a rank-1 data matrix. All three questions are essentially asking the same thing in different ways. The null space captures the two redundant dimensions — variations between questions that do not reflect real differences in the trait being measured.', question: 'When 3 survey questions measure only 1 underlying trait, what is the rank of the data matrix?', answer: 'one underlying factor' },
      { emoji: '📱', title: 'Network Traffic', equation: '', story: 'In a network with 3 routers forwarding 2 data streams, the routing matrix has rank at most 2. The rank determines the maximum throughput — how many independent data streams can be simultaneously routed. A rank-1 routing matrix means the network can only handle one stream at a time, regardless of how many routers exist.', question: 'In a network with multiple routers, what does the rank of the routing matrix determine?', answer: 'rank of routing matrix' },
    ],
    solveExplanation: 'M=[[2,4],[1,2],[3,6]] (3\u00d72, rank 1). R(M)=t(1,2) in \u211D\u00B2, C(M)=t(2,1,3) in \u211D\u00B3, N(M)=t(-2,1), N(M\u1d40)=plane. R\u22a5N, C\u22a5N\u1d40. Rank+Nullity=n!'
  },
  // Mission 50
  {
    id: 50, emoji: '\uD83C\uDF1F', title: 'Wisdom Achieved',
    story: 'Congratulations! You have completed the Linear Algebra mission. Let us summarize the wisdom: (1) A matrix defines four subspaces: Row Space, Column Space, Null Space, Left Null Space. (2) Row Space \u22a5 Null Space in the input domain. (3) Column Space \u22a5 Left Null Space in the output domain. (4) Rank-Nullity: rank(A) + nullity(A) = n. (5) A singular matrix collapses dimensions \u2014 information is lost along the null space. You now see linear algebra as the study of subspaces and their relationships!',
    goal: 'Celebrate the achievement and summarize the key insights.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Which statement best captures the essence of linear algebra?',
    options: null,
    correct: null,
    expectedKeywords: ['subspaces', 'orthogonal', 'four', 'rank', 'dimension', 'relationship'],
    explanation: 'Linear algebra is fundamentally about the four subspaces and their orthogonal relationships. Every matrix tells a story: R(A) shows what inputs matter, N(A) shows what inputs are lost, C(A) shows what outputs are reachable, and N(A\u1d40) shows what outputs are unreachable. Rank tells us how many dimensions survive!',
    ggbHint: 'Use GeoGebra to explore any matrix and discover its four subspaces. Each matrix has a story to tell!',
    ggbSteps: [
      'Pick any matrix and type it into GeoGebra.',
      'Compute Rank(A) \u2014 how many dimensions survive?',
      'Find N(A) \u2014 what information is lost?',
      'Find C(A) \u2014 what outputs are reachable?',
      'Remember: every matrix has this beautiful structure!'
    ],
    quiz: [
      { q: 'Does every matrix define exactly 4 fundamental subspaces?', type: 'yesno', correct: 0 },
      { q: 'Is the dimension of C(A) equal to the rank of A?', type: 'yesno', correct: 0 },
      { q: 'Have you achieved Linear Algebra wisdom?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🏗️', title: 'Engineering', equation: '', story: 'Every linear system in engineering — from bridges to circuits to control systems — is ultimately understood through its four fundamental subspaces. The row space tells you what inputs matter, the null space tells you what is lost, the column space tells you what outputs are reachable, and the left null space tells you what is unobservable. Mastering these four subspaces is the key to mastering engineering.', question: 'What mathematical framework is essential for understanding every linear system in engineering?', answer: 'four subspaces' },
      { emoji: '📊', title: 'Data Science', equation: '', story: 'Dimensionality reduction (PCA), regression analysis, and matrix factorisation all rely on subspace thinking. PCA finds the row space to keep and the null space to discard. Regression finds the column space of reachable predictions. Matrix factorisation decomposes data into interpretable subspace components.', question: 'What is the core mathematical concept behind PCA, regression, and matrix factorisation in data science?', answer: 'linear algebra subspaces' },
      { emoji: '🤖', title: 'AI & ML', equation: '', story: 'A neural network is essentially a composition of linear transformations, each followed by a non-linear activation. Each layer has its own four subspaces: what it can represent (column space), what it discards (null space), what inputs matter (row space), and what is hidden (left null space). Understanding these subspaces helps explain why neural networks work.', question: 'What is each layer of a neural network essentially performing in mathematical terms?', answer: 'a linear transformation' },
    ],
    solveExplanation: 'Four subspaces, two orthogonal pairs, rank-nullity theorem: the complete picture of any linear transformation. Congratulations on your Linear Algebra wisdom!'
  },
  // Mission 51
  {
    id: 51, emoji: '\uD83C\uDFAC', title: 'User-Item Matrix',
    story: 'Netflix has users and movies. Build a 3\u00d74 rating matrix R where rows = users (Alice, Bob, Charlie) and columns = movies (M1, M2, M3, M4). Ratings: Alice=(5,3,0,1), Bob=(4,0,0,1), Charlie=(1,1,5,4). This matrix has rank? Compute Rank(R) in GeoGebra. The null space reveals which rating patterns never occur!',
    goal: 'Understand the user-item rating matrix and its rank.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'What is the rank of the 3×4 rating matrix R = [[5,3,0,1],[4,0,0,1],[1,1,5,4]]?',
    options: null,
    correct: null,
    expectedKeywords: ['3', 'full row rank', 'rank 3', 'three'],
    explanation: 'Rank(R) = 3 (full row rank). Each user has an independent rating pattern. The null space is {0} (only the zero vector maps to zero). The column space is 3D \u2014 ratings live in a 3D subspace of \u211D\u2074. SVD would reveal latent features like "genre preferences"!',
    ggbHint: 'Type: R={{5,3,0,1},{4,0,0,1},{1,1,5,4}}. Compute Rank(R) in GeoGebra. Try NullSpace(R) as well.',
    ggbSteps: [
      'Type: R = {{5,3,0,1},{4,0,0,1},{1,1,5,4}}.',
      'Type: Rank(R) \u2014 shows 3. Full row rank!',
      'Type: NullSpace(R) \u2014 only {0}.',
      'Each user rating vector is linearly independent.',
      'No redundancy in user preferences \u2014 3 independent taste profiles.'
    ],
    quiz: [
      { q: 'Can the rank of a 3×4 matrix be at most 3?', type: 'yesno', correct: 0 },
      { q: 'Does rank measure the number of independent user taste profiles in a rating matrix?', type: 'yesno', correct: 0 },
      { q: 'If rank < number of users, what does that mean?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🎬', title: 'Netflix', equation: '', story: 'Netflix\'s recommendation system is built on a massive user-movie rating matrix with millions of users and tens of thousands of movies. Even though this matrix is enormous, it has surprisingly low rank — because most users\' preferences can be explained by just a few latent factors like genre preference, recency bias, and viewing habits. Low rank reveals hidden patterns.', question: 'What does a low-rank rating matrix at Netflix reveal about user preferences?', answer: 'latent preferences' },
      { emoji: '📱', title: 'Amazon', equation: '', story: 'Amazon tracks which products each customer has purchased in a user-product matrix. The rank of this matrix reveals the underlying product categories — if rank is 5, there are roughly 5 distinct shopping patterns among customers. Low-rank structure means customers tend to buy items from a few categories, not randomly across all products.', question: 'What does the rank of Amazon\'s purchase history matrix reveal about products?', answer: 'product categories' },
      { emoji: '🎵', title: 'Spotify', equation: '', story: 'Spotify builds a user-song play count matrix to understand music taste. Using SVD (Singular Value Decomposition), this matrix is decomposed into latent factors — abstract dimensions like "preference for upbeat music" or "love of classical piano." These latent factors from SVD are what drive Spotify\'s Discover Weekly recommendations.', question: 'What does SVD decomposition of Spotify\'s play count matrix reveal?', answer: 'latent factors from SVD' },
    ],
    solveExplanation: 'R = 3\u00d74 rating matrix, rank 3. Each user is independent \u2014 no redundant tastes. In real systems, rating matrices are approximately low-rank = latent factors!'
  },
  // Mission 52
  {
    id: 52, emoji: '\uD83D\uDEE0\uFE0F', title: 'Collaborative Filtering',
    story: 'To recommend movies to Bob, find users similar to Bob using dot products / cosine similarity. Bob = (4,0,0,1). Alice = (5,3,0,1). Dot(Bob, Alice) = 4\u00b75 + 0\u00b73 + 0\u00b70 + 1\u00b71 = 21. Charlie = (1,1,5,4). Dot(Bob, Charlie) = 4\u00b71 + 0\u00b71 + 0\u00b75 + 1\u00b74 = 8. Alice is more similar! Recommend movies Alice liked that Bob hasn\'t seen: M2 (rating 3)!',
    goal: 'Use dot products to find similar users for recommendations.',
    ggbType: 'graphing',
    answerType: 'num',
    prompt: 'What is the dot product of Bob (4,0,0,1) and Charlie (1,1,5,4)?',
    correct: 8,
    tolerance: 0,
    explanation: 'Dot(Bob, Charlie) = 4\u00b71 + 0\u00b71 + 0\u00b75 + 1\u00b74 = 4 + 0 + 0 + 4 = 8. Dot(Bob, Alice) = 21, so Alice is more similar. Collaborative filtering: find nearest neighbors (highest dot product / cosine similarity) and recommend items they liked that you haven\'t seen.',
    ggbHint: 'Type vectors: bob=(4,0,0,1), alice=(5,3,0,1), charlie=(1,1,5,4). Compute Dot(bob,alice) and Dot(bob,charlie).',
    ggbSteps: [
      'Type: bob = (4,0,0,1), alice = (5,3,0,1), charlie = (1,1,5,4).',
      'Type: Dot(bob, alice) = 21 \u2014 high similarity.',
      'Type: Dot(bob, charlie) = 8 \u2014 lower similarity.',
      'Alice is Bob\'s nearest neighbor.',
      'Recommend M2 (rating 3 from Alice, unrated by Bob)!'
    ],
    quiz: [
      { q: 'Does the dot product measure similarity between two vectors?', type: 'yesno', correct: 0 },
      { q: 'Is Bob most similar to Alice based on their ratings?', type: 'yesno', correct: 0 },
      { q: 'If two users have dot product 0, are they similar?', type: 'yesno', correct: 1 }
    ],
    realLife: [
      { emoji: '🎬', title: 'Netflix', equation: '', story: 'Netflix\'s "Users who liked this also liked..." feature works by computing the similarity between users using dot products on their rating vectors. Users with high dot products have similar taste. The system finds your nearest neighbours (most similar users) and recommends movies they loved but you have not yet seen.', question: 'How does Netflix identify users with similar taste to yours?', answer: 'high dot product' },
      { emoji: '🛒', title: 'Amazon', equation: '', story: 'Amazon\'s "Frequently bought together" feature uses the same principle. It computes the dot product between your purchase history vector and other customers\' vectors. Customers with high dot product scores tend to buy similar products. Amazon then suggests items that those similar customers bought but you have not.', question: 'What does Amazon\'s "Frequently bought together" feature use to find similar customers?', answer: 'similar purchase vectors' },
      { emoji: '🎵', title: 'Spotify', equation: '', story: 'Spotify\'s Discover Weekly playlist is powered by collaborative filtering — the same dot-product-based technique used by Netflix and Amazon. Your listening history is a vector, and Spotify finds users with the most similar vectors (highest dot products). Songs that those similar users loved but you have not heard appear in your playlist.', question: 'What powers Spotify\'s Discover Weekly playlist recommendations?', answer: 'collaborative filtering' },
    ],
    solveExplanation: 'Dot(Bob,Alice)=21 > Dot(Bob,Charlie)=8. Alice is more similar. Recommend movies Alice liked that Bob hasn\'t seen \u2014 collaborative filtering in action!'
  },
  // Mission 53
  {
    id: 53, emoji: '\uD83D\uDD0D', title: 'Web as a Graph',
    story: 'Google PageRank models the web as a directed graph. Pages = nodes, Links = edges. Consider 4 pages: A\u2192B, A\u2192C, B\u2192C, C\u2192A, D\u2192C. Build the adjacency matrix where M(i,j)=1 if page j links to page i. Then normalize columns so each column sums to 1 \u2014 this is a Markov chain transition matrix! The steady-state eigenvector gives page rankings.',
    goal: 'Build the web graph adjacency matrix and understand the PageRank Markov chain.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'For the web graph A→B, A→C, B→C, C→A, D→C, which page has the most incoming links?',
    options: null,
    correct: null,
    expectedKeywords: ['C', 'page C', 'three', '3 incoming'],
    explanation: 'C has 3 incoming links (from A, B, D). In PageRank, more incoming links = more important. The adjacency column-stochastic matrix is: [[0,0,1,0],[1,0,0,0],[1,1,0,1],[0,0,0,0]]. The eigenvector with eigenvalue 1 gives PageRank scores!',
    ggbHint: 'Type: M={{0,0,1,0},{1,0,0,0},{1,1,0,1},{0,0,0,0}}. Each column shows outgoing links. Normalize so columns sum to 1.',
    ggbSteps: [
      'Type: M = {{0,0,1,0},{1,0,0,0},{1,1,0,1},{0,0,0,0}}.',
      'Column 1: A links to B and C.',
      'Column 2: B links to C.',
      'Column 3: C links to A.',
      'Column 4: D links to C. Page C has most links!'
    ],
    quiz: [
      { q: 'Do incoming links from important pages give a higher PageRank?', type: 'yesno', correct: 0 },
      { q: 'Does the PageRank algorithm solve the eigenvector problem Mv = v?', type: 'yesno', correct: 0 },
      { q: 'Is the web graph adjacency matrix usually sparse?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🔍', title: 'Google Search', equation: '', story: 'Google\'s original PageRank algorithm models the entire web as a directed graph — each page is a node, and each hyperlink is an edge. By converting this graph into a column-stochastic transition matrix and finding its dominant eigenvector (the eigenvector with eigenvalue 1), Google determines the importance of every page. Pages with more incoming links from important pages rank higher.', question: 'What mathematical object does Google\'s PageRank algorithm compute to rank web pages?', answer: 'eigenvector of web graph' },
      { emoji: '📱', title: 'Social Media', equation: '', story: 'Twitter\'s "Who to Follow" feature uses eigenvector centrality on the follow graph. Your influence score depends not just on how many followers you have, but on how influential those followers are. This is computed as the dominant eigenvector of the social network\'s adjacency matrix — the same principle as PageRank.', question: 'How is influence measured on social media platforms like Twitter?', answer: 'eigenvector centrality' },
      { emoji: '🏆', title: 'Sports Rankings', equation: '', story: 'Sports leagues use eigenvector centrality to rank teams based on their win-loss records. Beating a strong team gives you more ranking points than beating a weak team. The ranking is computed as the eigenvector of the win-loss adjacency matrix, ensuring that the quality of opponents matters, not just the number of wins.', question: 'How are team rankings computed when the quality of opponents matters?', answer: 'eigenvector of win matrix' },
    ],
    solveExplanation: 'PageRank: adjacency matrix \u2192 column-stochastic \u2192 eigenvector with eigenvalue 1 = page importance scores. More incoming links from important pages = higher rank!'
  },
  // Mission 54
  {
    id: 54, emoji: '\uD83D\uDCCA', title: 'Power Method',
    story: 'To compute PageRank, use the Power Method: start with any vector v\u2080, repeatedly multiply by the transition matrix M. After enough iterations, v converges to the dominant eigenvector (PageRank). For M = column-stochastic matrix of 4 pages, start with v=(0.25,0.25,0.25,0.25) and multiply by M repeatedly until stable.',
    goal: 'Compute the PageRank eigenvector using repeated matrix multiplication.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Starting with v=(0.25,0.25,0.25,0.25), after one multiplication by M (from Q53), which page has the highest score?',
    options: null,
    correct: null,
    expectedKeywords: ['C', 'page C', '0.75', 'highest'],
    explanation: 'M*v = (0.25\u00d70 + 0.25\u00d70 + 0.25\u00d71 + 0.25\u00d70, 0.25\u00d71 + 0, 0.25\u00d71 + 0.25\u00d71 + 0.25\u00d70 + 0.25\u00d71, 0) = (0.25, 0.25, 0.75, 0). Page C has the highest score (0.75)! Repeated multiplication converges to the true PageRank vector where C remains highest.',
    ggbHint: 'Type: M={{0,0,1,0},{1,0,0,0},{1,1,0,1},{0,0,0,0}}. Type: v0={0.25,0.25,0.25,0.25}. Compute M*v0 repeatedly.',
    ggbSteps: [
      'Type: M = {{0,0,1,0},{1,0,0,0},{1,1,0,1},{0,0,0,0}}.',
      'Type: v0 = {0.25, 0.25, 0.25, 0.25}.',
      'Type: v1 = M*v0 = (0.25, 0.25, 0.75, 0). C leads!',
      'Keep multiplying: v2 = M*v1. Values converge.',
      'The steady state = eigenvector with eigenvalue 1 = PageRank!'
    ],
    quiz: [
      { q: 'Does the Power Method converge to the dominant (largest) eigenvector?', type: 'yesno', correct: 0 },
      { q: 'After the first matrix multiplication in the Power Method, was C score 0.75?', type: 'yesno', correct: 0 },
      { q: 'Does the power method always converge?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🔍', title: 'Google', equation: '', story: 'Google\'s original PageRank algorithm did not solve the eigenvector equation directly — that would be too slow for billions of pages. Instead, it used the Power Method: start with any ranking vector and repeatedly multiply by the web graph\'s transition matrix. After enough iterations, the vector converges to the dominant eigenvector — the PageRank scores.', question: 'At what scale was Google\'s original PageRank power iteration computed?', answer: 'billions of pages' },
      { emoji: '📱', title: 'Twitter', equation: '', story: 'Twitter\'s WhoToFollow system uses a personalised version of PageRank. Instead of computing the global eigenvector, it computes a power iteration starting from your specific follow graph. This gives you a personalised ranking of accounts you might find interesting, based on your unique position in the social network.', question: 'What does Twitter\'s WhoToFollow feature use to generate personalised suggestions?', answer: 'personalized PageRank' },
      { emoji: '📊', title: 'Citation Networks', equation: '', story: 'Academic paper importance is measured using eigenvector centrality of the citation graph. A paper cited by many important papers is itself important. The Power Method iteratively computes each paper\'s importance score by aggregating the scores of all papers that cite it, converging to the true influence ranking.', question: 'How is academic paper importance computed from the citation graph?', answer: 'high eigenvector score' },
    ],
    solveExplanation: 'Power method: v_{k+1} = M v_k. Converges to dominant eigenvector (eigenvalue 1) = PageRank scores. C has highest score (0.75), D has lowest (0).'
  },
  // Mission 55
  {
    id: 55, emoji: '\uD83D\uDCC8', title: 'Dimensionality Reduction',
    story: 'PCA (Principal Component Analysis) finds the directions of maximum variance in data. Given 2D points: (1,1), (2,2), (3,3), (1,4), (2,5), (3,6). Center the data (subtract mean), compute covariance matrix, find eigenvectors. The eigenvector with largest eigenvalue = first principal component \u2014 direction of most variance. Project data onto this component to reduce from 2D to 1D!',
    goal: 'Use eigendecomposition to find principal components and reduce dimensions.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'For points along y=x (1,1), (2,2), (3,3), what is the first principal component direction?',
    options: null,
    correct: null,
    expectedKeywords: ['(1,1)', '1,1', 'direction', 'y=x', 'line', '45'],
    explanation: 'Points (1,1), (2,2), (3,3) vary along y=x. The covariance matrix eigenvector with largest eigenvalue is (1,1) (normalized). The second eigenvector (1,-1) has zero eigenvalue \u2014 no variance in that direction. PCA would project onto (1,1), reducing 2D \u2192 1D while preserving all variance!',
    ggbHint: 'Plot points: (1,1),(2,2),(3,3),(1,4),(2,5),(3,6). They roughly follow y=x. The first PC = direction (1,1).',
    ggbSteps: [
      'Plot the points: (1,1), (2,2), (3,3), (1,4), (2,5), (3,6).',
      'Observe: most variance is along the line y=x direction.',
      'First principal component = direction (1,1) (45\u00b0 line).',
      'Second PC = perpendicular direction (1,-1) \u2014 little variance.',
      'Project onto first PC: 2D \u2192 1D along y=x!'
    ],
    quiz: [
      { q: 'Does PCA find directions of maximum variance in the data?', type: 'yesno', correct: 0 },
      { q: 'Is the eigenvector with the largest eigenvalue the first principal component?', type: 'yesno', correct: 0 },
      { q: 'Does reducing dimensions always lose some information?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '📷', title: 'Face Recognition', equation: '', story: 'Eigenfaces is a classic face recognition technique that uses PCA on face images. Each face image has millions of pixels, but PCA reduces this to around 100 eigenface coefficients — the principal components. These 100 numbers capture the essential features of a face (shape, lighting, expression) while discarding irrelevant details like background and image noise.', question: 'How does the Eigenfaces technique reduce millions of face pixels to a manageable number?', answer: 'principal components of faces' },
      { emoji: '📊', title: 'Finance', equation: '', story: 'Financial analysts use PCA to reduce hundreds of stock return time series to a few market factors. The first principal component typically represents the overall market movement. The second might represent sector-specific trends. This dimensionality reduction reveals the hidden structure driving stock prices across the entire market.', question: 'When PCA is applied to stock returns, what do the principal components represent?', answer: 'principal components' },
      { emoji: '🧬', title: 'Genomics', equation: '', story: 'In genomics, researchers measure thousands of gene expression levels for each patient. PCA reduces this high-dimensional data to 2-3 principal components that can be plotted on a scatter plot. Patients with similar genetic profiles cluster together, revealing hidden patterns like disease subtypes or treatment responses.', question: 'How does PCA help genomics researchers visualise high-dimensional gene expression data?', answer: 'reduced by PCA' },
    ],
    solveExplanation: 'PCA: center data \u2192 covariance matrix \u2192 eigenvectors. Largest eigenvalue = direction of max variance. Projecting onto top components reduces dimensions while preserving variance!'
  },
  // Mission 56
  {
    id: 56, emoji: '\uD83C\uDF1F', title: 'SVD & The Big Picture',
    story: 'The Singular Value Decomposition (SVD) A = U\u03a3V\u1d40 unifies everything you have learned: U columns = eigenvectors of AA\u1d40 (left singular vectors = basis for column space). V columns = eigenvectors of A\u1d40A (right singular vectors = basis for row space). Non-zero singular values = square roots of eigenvalues. Zero singular values = null space! SVD reveals the four subspaces and their dimensions automatically!',
    goal: 'Connect SVD to the four subspaces and see the complete picture.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'For A = [[1,2],[2,4]] (rank 1), how many non-zero singular values does SVD give?',
    options: null,
    correct: null,
    expectedKeywords: ['1', 'one', 'rank'],
    explanation: 'A=[[1,2],[2,4]] has rank 1, so SVD gives 1 non-zero singular value (\u03c3\u2081 = \u221a(5\u00b2+0) = 5 approximately). The zero singular value corresponds to the null space direction. SVD automatically separates the range (non-zero \u03c3) from the null space (zero \u03c3). Number of non-zero singular values = rank!',
    ggbHint: 'Type: A={{1,2},{2,4}}. GeoGebra can compute SVD: SingularValues(A) gives the list. Count non-zero ones = rank!',
    ggbSteps: [
      'Type: A = {{1,2},{2,4}}.',
      'Type: Rank(A) = 1.',
      'Type: SingularValues(A) \u2192 one non-zero value.',
      'The number of non-zero singular values = rank!',
      'SVD gives the complete picture: range basis (U), row space basis (V), and rank (\u03c3).'
    ],
    quiz: [
      { q: 'Does the number of non-zero singular values equal the rank of the matrix?', type: 'yesno', correct: 0 },
      { q: 'Do zero singular values correspond to the null space directions?', type: 'yesno', correct: 0 },
      { q: 'Does SVD reveal all four subspaces?', type: 'yesno', correct: 0 }
    ],
    realLife: [
      { emoji: '🎬', title: 'Netflix Prize', equation: '', story: 'The Netflix Prize was a million-dollar competition to improve movie recommendations. The winning solution used SVD (Singular Value Decomposition) to factorise the massive user-movie rating matrix into three smaller matrices: user factors, singular values, and movie factors. This factorisation revealed latent features that captured hidden patterns in viewing behaviour.', question: 'What was the core mathematical technique used to win the Netflix Prize competition?', answer: 'user-movie latent factors' },
      { emoji: '📷', title: 'Image Compression', equation: '', story: 'JPEG image compression uses a mathematical transform (DCT, which is closely related to SVD) to decompose an image into frequency components. By keeping only the largest singular values — the most important frequency components — and discarding the small ones, JPEG achieves dramatic compression while maintaining visual quality.', question: 'In JPEG image compression, what does keeping only the largest singular values achieve?', answer: 'keep top singular values' },
      { emoji: '📊', title: 'Topic Modeling', equation: '', story: 'Latent Semantic Analysis (LSA) applies SVD to a document-word matrix to discover hidden topics. The singular vectors reveal which words tend to co-occur — words like "queen", "king", and "crown" cluster together as a "royalty" topic. SVD automatically discovers these semantic relationships without any human labelling.', question: 'What technique is used to automatically discover topics from a document-word matrix?', answer: 'SVD on document matrix' },
    ],
    solveExplanation: 'SVD: A = U\u03a3V\u1d40. Non-zero \u03c3 = rank. Zero \u03c3 = null space. U columns span C(A), V columns span R(A). SVD reveals all four subspaces at once!'
  },
];

/* ── GeoGebra embed component ──────────────────────── */
function GGBEmbed({ missionId }) {
  const [ggbFailed, setGgbFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const wrapRef = useRef(null);
  const appletRef = useRef(null);
  const origSizeRef = useRef({ w: 0, h: 0 });
  const containerId = 'ggb-' + missionId;

  useEffect(() => {
    let cancelled = false;
    const el = wrapRef.current;
    if (!el) return;
    if (document.getElementById(containerId)) return;

    const tryInject = () => {
      if (!window.GGBApplet || cancelled) { setGgbFailed(true); return; }
      const rect = el.getBoundingClientRect();
      const params = {
        appName: 'graphing',
        width: Math.round(Math.max(rect.width - 2, 300)),
        height: Math.round(Math.max(rect.height - 2, 300)),
        showToolBar: true,
        showMenuBar: true,
        showAlgebraInput: true,
        enableRightClick: false,
        language: 'en',
        borderColor: '#2c2622',
        id: containerId,
      };
      try {
        const applet = new window.GGBApplet(params);
        applet.inject(containerId);
        appletRef.current = applet;
      } catch (e) {
        if (!cancelled) setGgbFailed(true);
      }
    };

    const inner = document.createElement('div');
    inner.id = containerId;
    inner.style.width = '100%';
    inner.style.height = '100%';
    el.appendChild(inner);

    const timer = setTimeout(tryInject, 400);
    return () => { cancelled = true; clearTimeout(timer); el.innerHTML = ''; };
  }, [missionId]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      if (!origSizeRef.current.w) {
        origSizeRef.current = { w: Math.round(rect.width), h: Math.round(rect.height) };
      }
      const targetW = fullscreen ? Math.round(rect.width) : origSizeRef.current.w;
      const targetH = fullscreen ? Math.round(rect.height) : origSizeRef.current.h;
      if (targetW < 100 || targetH < 100) return;
      const retryResize = (attempt = 0) => {
        if (!appletRef.current) {
          if (attempt < 10) setTimeout(() => retryResize(attempt + 1), 200);
          return;
        }
        const api = appletRef.current.getAppletObject();
        if (!api) {
          if (attempt < 10) setTimeout(() => retryResize(attempt + 1), 200);
          return;
        }
        try {
          if (typeof api.setWidth === 'function') api.setWidth(targetW);
          if (typeof api.setHeight === 'function') api.setHeight(targetH);
        } catch (e) {}
      };
      setTimeout(retryResize, 100);
    });
  }, [fullscreen, containerId]);

  return (
    <div className={'la-ggb-outer' + (fullscreen ? ' fullscreen' : '')}>
      <div className="la-ggb-wrap" ref={wrapRef}>
        {ggbFailed && (
          <div className="fallback-message">
            <p>GeoGebra could not load. Try refreshing or work on paper!</p>
          </div>
        )}
      </div>
      <button className="la-ggb-fullscreen-btn" onClick={() => setFullscreen(v => !v)} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
        {fullscreen ? '✕' : '⛶'}
      </button>
    </div>
  );
}

/* ── Mini graph for real-life expanded view ──────────── */
function parseLinearParams(story) {
  const pat1 = story.match(/=\s*(\d+(?:\.\d+)?)\s*x\s*\+\s*(\d+(?:\.\d+)?)/);
  if (pat1) return { m: +pat1[1], b: +pat1[2] };
  const pat2 = story.match(/=\s*(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*x/i);
  if (pat2) return { m: +pat2[2], b: +pat2[1] };
  const pat3 = story.match(/=\s*(\d+(?:\.\d+)?)\s*x\s*[\.\s,;]/);
  if (pat3) return { m: +pat3[1], b: 0 };
  const pat4 = story.match(/(\d+(?:\.\d+)?)\D*\+\s*\D*(\d+(?:\.\d+)?)\D*\//);
  if (pat4) return { m: +pat4[2], b: +pat4[1] };
  const pat5 = story.match(/=\s*(\d+(?:\.\d+)?)\s*x\s*\+\s*(\d+(?:\.\d+)?)/i);
  if (pat5) return { m: +pat5[1], b: +pat5[2] };
  const pat6 = story.match(/(\d+(?:\.\d+)?)\s*x\s*\+\s*(\d+(?:\.\d+)?)/);
  if (pat6) return { m: +pat6[1], b: +pat6[2] };
  const pat7 = story.match(/=\s*(\d+(?:\.\d+)?)\s*[a-z]\s*\+\s*(\d+(?:\.\d+)?)/i);
  if (pat7) return { m: +pat7[1], b: +pat7[2] };
  const pat8 = story.match(/=\s*(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*[a-z]/i);
  if (pat8) return { m: +pat8[2], b: +pat8[1] };
  const pat9 = story.match(/=-\s*(\d+(?:\.\d+)?)\s*[a-z]\s*\+\s*(\d+(?:\.\d+)?)/i);
  if (pat9) return { m: -(+pat9[1]), b: +pat9[2] };
  const pat11 = story.match(/=\s*(\d+(?:\.\d+)?)\s*x(?!\s*[\+\-])/i);
  if (pat11) return { m: +pat11[1], b: 0 };
  return null;
}

function parseAxisLabels(story) {
  const s = story.toLowerCase();
  const unitMap = {'/km':'km','/min':'min','/screen':'screens','/litre':'litres','/liter':'litres','/kg':'kg','/unit':'units','/yr':'years','/week':'weeks','/hr':'hrs','/hour':'hrs','/day':'days','/mo':'mo'};
  let xLabel = 'x';
  for (const [k,v] of Object.entries(unitMap)) { if (s.includes(k)) { xLabel = v; break; } }
  if (s.includes('time') && xLabel==='x') xLabel = 'time';
  if (s.includes('quantity') && xLabel==='x') xLabel = 'quantity';
  let yLabel = 'y';
  if (s.includes('total=')||s.includes('total ')) yLabel = 'Total';
  else if (s.includes('fare')) yLabel = 'Fare (Rs)';
  else if (s.includes('interest')) yLabel = 'Interest';
  else if (s.includes('revenue')) yLabel = 'Revenue';
  else if (s.includes('cost')) yLabel = 'Cost (Rs)';
  else if (s.includes('price')) yLabel = 'Price';
  else if (s.includes('height')||s.includes('cm')||s.includes('cm/yr')) yLabel = 'Height (cm)';
  else if (s.includes('volume')) yLabel = 'Volume';
  else if (s.includes('distance')) yLabel = 'Distance';
  else if (s.includes('profit')) yLabel = 'Profit';
  if (s.includes('rs') && yLabel==='y') yLabel = 'Cost (Rs)';
  if (s.includes('inr') && yLabel==='y') yLabel = 'INR';
  return { xLabel, yLabel };
}

function MiniGraph({ story, equation }) {
  const { xLabel, yLabel } = parseAxisLabels(story || '');
  const params = parseLinearParams(equation || story || '');
  const hasEq = params && !isNaN(params.m) && !isNaN(params.b);
  const W = 260, H = 210, titleH = hasEq ? 24 : 0, pad = 36;
  const defaultMax = 10;
  const fmt = v => Number.isInteger(v) ? v.toString() : v.toFixed(1);

  let m, b, xMax, yEnd, yMax, eqLabel, sx, sy, xTicks, yTicks, xStep, yStep;
  if (hasEq) {
    m = params.m; b = params.b;
    xMax = Math.max(10, Math.min(50, Math.ceil(Math.abs(b) / (Math.abs(m) || 1) * 0.8)));
    yEnd = m * xMax + b;
    yMax = Math.max(b, yEnd, 10) * 1.2;
    xTicks = Math.min(Math.floor(xMax / 2) + 1, 6);
    yTicks = Math.min(Math.floor(yMax / 2) + 1, 6);
    xStep = Math.ceil(xMax / xTicks);
    yStep = Math.ceil(yMax / yTicks);
    const mStr = m === 1 ? '' : m === -1 ? '-' : fmt(m);
    eqLabel = `y = ${mStr}x${b > 0 ? ' + ' + b : b < 0 ? ' - ' + Math.abs(b) : ''}`;
  } else {
    xMax = defaultMax; yEnd = defaultMax; yMax = defaultMax * 1.2;
    xTicks = 5; yTicks = 5; xStep = 2; yStep = 2;
    eqLabel = null;
  }
  sx = x => pad + (x / xMax) * (W - 2 * pad);
  sy = y => (H - titleH - pad) - (y / yMax) * (H - titleH - 2 * pad);
  const legendX = W - 75, legendY = titleH + 4;

  return (
    <div style={{ textAlign: 'center', marginBottom: 6 }}>
      {eqLabel && <div style={{ fontSize:'0.85rem', fontWeight:600, color:'#e67e22', marginBottom:2, fontFamily:'var(--font-mono, monospace)' }}>{eqLabel}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="la-mini-graph" style={{ width:'100%', maxWidth:300, display:'inline-block', background:'#fafafa', borderRadius:8, border:'1px solid #e0e0e0' }}>
        {Array.from({length: xTicks+1}, (_, i) => i * xStep).map(v => (
          <line key={`gx${v}`} x1={sx(v)} y1={sy(0)} x2={sx(v)} y2={sy(yMax)} stroke="#eee" strokeWidth={0.5} />
        ))}
        {Array.from({length: yTicks+1}, (_, i) => i * yStep).map(v => (
          <line key={`gy${v}`} x1={sx(0)} y1={sy(v)} x2={sx(xMax)} y2={sy(v)} stroke="#eee" strokeWidth={0.5} />
        ))}
        <line x1={sx(0)} y1={sy(0)} x2={sx(xMax)} y2={sy(0)} stroke="#999" strokeWidth={1.5} />
        <line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(yMax)} stroke="#999" strokeWidth={1.5} />

        {hasEq && <line x1={sx(0)} y1={sy(b)} x2={sx(xMax)} y2={sy(yEnd)} stroke="#e67e22" strokeWidth={2.5} strokeLinecap="round" />}

        {Array.from({length: xTicks+1}, (_, i) => i * xStep).filter(v => v > 0).map(v => (
          <text key={`xl${v}`} x={sx(v)} y={sy(0)+14} fontSize={8} fill="#888" textAnchor="middle">{v}</text>
        ))}
        {Array.from({length: yTicks+1}, (_, i) => i * yStep).filter(v => v > 0).map(v => (
          <text key={`yl${v}`} x={sx(0)-8} y={sy(v)+3} fontSize={8} fill="#888" textAnchor="end">{v}</text>
        ))}
        <text x={sx(0)-5} y={sy(0)-4} fontSize={8} fill="#888" textAnchor="middle">O</text>

        <text x={sx(xMax)-5} y={sy(0)+16} fontSize={10} fill="#333" fontWeight={600}>{xLabel}</text>
        <text x={sx(0)+7} y={sy(yMax)+3} fontSize={10} fill="#333" fontWeight={600}>{yLabel}</text>

        {hasEq && b > 0 && (
          <>
            <line x1={sx(0)} y1={sy(b)} x2={sx(xMax*0.15)} y2={sy(b)} stroke="#e74c3c" strokeWidth={0.5} strokeDasharray="2,2" />
            <text x={sx(0)-5} y={sy(b/2)} fontSize={8} fill="#e74c3c" textAnchor="end" opacity={0.6}>b</text>
          </>
        )}
        {hasEq && <circle cx={sx(0)} cy={sy(b)} r={4.5} fill="#e74c3c" stroke="#fff" strokeWidth={1.5} />}
        {hasEq && <text x={sx(0)-6} y={sy(b)-8} fontSize={9} fill="#e74c3c" textAnchor="end" fontWeight={600}>{`(0, ${fmt(b)})`}</text>}
        {hasEq && yEnd > 0 && (
          <text x={sx(xMax)} y={sy(yEnd)-8} fontSize={9} fill="#e67e22" textAnchor="middle" fontWeight={600}>{`(${fmt(xMax)}, ${fmt(yEnd)})`}</text>
        )}

        {hasEq && (
          <>
            <rect x={legendX} y={legendY} width={68} height={34} rx={4} fill="#fff" stroke="#e0e0e0" strokeWidth={0.5} />
            <text x={legendX+6} y={legendY+13} fontSize={8} fill="#e74c3c" fontWeight={600}>{`b = ${fmt(b)}`}</text>
            <text x={legendX+6} y={legendY+26} fontSize={8} fill="#e67e22" fontWeight={600}>{`m = ${fmt(m)}`}</text>
          </>
        )}
      </svg>
    </div>
  );
}

function generateMqExplanation(q) {
  try {
  const d = q.data || {};
  const s = [];
  const t = q.type || '';
  const ans = q.answer || q.display || '';
  const step = (label, text) => s.push({ label, text });

  if (t === 'm1_yval') { step('Identify', `We have y = ${d.m}x.`); step('Substitute', `Plug in x = ${d.x}: y = ${d.m} × ${d.x}.`); step('Compute', `${d.m} × ${d.x} = ${d.m * d.x}.`); step('Answer', `y = ${ans}`); }
  else if (t === 'm1_ratio') { step('Identify', `y = ${d.m}x means y is ${d.m} times x.`); step('Ratio', `y:x = ${d.m}:1.`); step('Answer', `Ratio = ${ans}`); }
  else if (t === 'm1_findk') { step('Set up', `${d.c} = k × ${d.b}.`); step('Solve', `k = ${d.c} ÷ ${d.b} = ${d.k}.`); step('Verify', `${d.k} × ${d.b} = ${d.c}. ✓`); step('Answer', `k = ${ans}`); }
  else if (t === 'm1_eval') { step('Understand', `Ram saves ${d.m}x what Lakshman saves (${d.x}).`); step('Calculate', `Ram saves ${d.m} × ${d.x} = ${d.m * d.x}.`); step('Answer', `${ans}`); }
  else if (t === 'm1_compare') { step('Slopes', `y=${d.m1}x → slope ${d.m1}; y=${d.m2}x → slope ${d.m2}.`); step('Ratio', `${d.m2} ÷ ${d.m1} = ${d.m2 / d.m1}.`); step('Answer', `${ans}`); }
  else if (t === 'm1_origin') { step('Test', `At x=0: y = ${d.m}(0) = 0.`); step('Conclusion', `Passes through (0,0).`); step('Answer', `y = ${ans}`); }
  else if (t === 'm1_slope') { step('Formula', `Slope = (y₂−y₁)/(x₂−x₁).`); step('Compute', `(${d.y2}−${d.y1})/(${d.x2}−${d.x1}) = ${d.m}.`); step('Answer', `Slope = ${ans}`); }
  else if (t === 'm1_notprop') { step('Concept', `y = kx with no constant term.`); step('Fix', `Set b = 0.`); step('Answer', `b = ${ans}`); }
  else if (t === 'm1_inverse') { step('Set up', `${d.a}x = ${d.y}.`); step('Solve', `x = ${d.y}/${d.a} = ${d.x}.`); step('Answer', `x = ${ans}`); }
  else if (t === 'm2_slope') { step('Compute', `(${d.y1}−0)/(${d.x1}−1) = ${d.y1}.`); step('Answer', `Slope = ${ans}`); }
  else if (t === 'm2_collinear') { step('Check', `Slope (2,1)→(3,2)=1; (3,2)→(4,3)=1.`); step('Conclusion', `Same slopes → collinear.`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm2_next') { step('Pattern', `x+1, y+1 each step.`); step('Extend', `(4,3) → (5,4).`); step('Answer', `${ans}`); }
  else if (t === 'm2_equation') { step('Line', `y = x − 1.`); step('Compute', `y = ${d.a+5} − 1 = ${d.a+4}.`); step('Answer', `y = ${ans}`); }
  else if (t === 'm2_slope2') { step('Compute', `(${d.y1+d.m}−${d.y1})/(${d.x1+1}−${d.x1}) = ${d.m}.`); step('Answer', `Slope = ${ans}`); }
  else if (t === 'm2_check') { step('Verify', `Is ${d.x-1} = ${d.x} − 1? Yes.`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm2_area') { step('Formula', `½|x₁(y₂−y₃)+x₂(y₃−y₁)+x₃(y₁−y₂)|.`); step('Answer', `Area = ${ans}`); }
  else if (t === 'm2_extend') { step('Slope', `(${d.m*d.x0}−${d.m*(d.x0-1)})/((${d.x0+1})−${d.x0}) = ${d.m}.`); step('Answer', `Slope = ${ans}`); }
  else if (t === 'm2_perpslope') { step('Rule', `m₁ × m₂ = −1.`); step('Compute', `−1/${d.m} = ${(-1/d.m).toFixed(4).replace(/\.?0+$/,'')}.`); step('Answer', `${ans}`); }
  else if (t === 'm3_through') { step('Test', `y=${d.a}(0)=0.`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm3_yval') { step('Compute', `y = ${d.a}×${d.x} = ${d.a*d.x}.`); step('Answer', `y = ${ans}`); }
  else if (t === 'm3_not') { step('Test', `y=2(0)+1=1≠0.`); step('Answer', `${ans} (No)`); }
  else if (t === 'm3_neg') { step('Test', `y=−${d.a}(0)=0.`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm3_intercept') { step('Condition', `0 = ${d.a}(0)+b → b=0.`); step('Answer', `b = ${ans}`); }
  else if (t === 'm3_scalar') { step('Check', `(3,${3*d.a}) = 3×(1,${d.a}).`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm3_intersect') { step('Set equal', `${d.a1}x = ${d.a2}x → x=0.`); step('Answer', `${ans}`); }
  else if (t === 'm3_proportional') { step('Definition', `k = slope = ${d.a}.`); step('Answer', `k = ${ans}`); }
  else if (t === 'm3_findx') { step('Solve', `${d.a}x = ${d.a*d.x} → x = ${d.x}.`); step('Answer', `x = ${ans}`); }
  else if (t === 'm4_yint') { step('Compute', `y=${d.m}(0)+${d.b}=${d.b}.`); step('Answer', `y-int = ${ans}`); }
  else if (t === 'm4_atzero') { step('Compute', `y = ${d.b}.`); step('Answer', `y = ${ans}`); }
  else if (t === 'm4_shift') { step('Concept', `b=3 shifts up 3 units.`); step('Answer', `${ans}`); }
  else if (t === 'm4_eval') { step('Compute', `y=${d.m}(${d.x})+${d.b}=${d.m*d.x+d.b}.`); step('Answer', `y = ${ans}`); }
  else if (t === 'm4_cross') { step('Compute', `y=3(0)+${d.b}=${d.b}.`); step('Answer', `y = ${ans}`); }
  else if (t === 'm4_noshift') { step('Concept', `No constant → passes through origin.`); step('Answer', `${ans}`); }
  else if (t === 'm4_parallel') { step('Compute', `|${d.b2}−${d.b1}| = ${Math.abs(d.b2-d.b1)}.`); step('Answer', `Distance = ${ans}`); }
  else if (t === 'm4_frompts') { step('Compute', `(${d.m*d.x+3}−3)/(${d.x}−0) = ${d.m}.`); step('Answer', `Slope = ${ans}`); }
  else if (t === 'm4_compare') { step('Diff', `(${d.b+1})−(${d.b}) = 1.`); step('Answer', `${ans}`); }
  else if (t === 'm5_steep') { step('Compare', `|${d.m+2}| > |${d.m}|.`); step('Answer', `y=${d.m+2}x steeper`); }
  else if (t === 'm5_intercept') { step('Compute', `y = 0+${d.b} = ${d.b}.`); step('Answer', `y = ${ans}`); }
  else if (t === 'm5_zero') { step('Compute', `y = 0.`); step('Answer', `y = ${ans}`); }
  else if (t === 'm5_both') { step('Compute', `y=${d.m}(${d.x})+${d.b}=${d.m*d.x+d.b}.`); step('Answer', `y = ${ans}`); }
  else if (t === 'm5_angle') { step('Compare', `|${d.m1}|=${Math.abs(d.m1)}, |${d.m2}|=${Math.abs(d.m2)}.`); step('Answer', `Slope ${Math.abs(d.m1)>Math.abs(d.m2)?d.m1:d.m2} larger`); }
  else if (t === 'm5_negative') { step('Concept', `Negative slope → line goes down.`); step('Answer', `down`); }
  else if (t === 'm5_perp') { step('Compute', `${d.m1}×${d.m2}=${d.m1*d.m2}.`); step('Answer', `Product = ${ans}`); }
  else if (t === 'm5_model') { step('Compute', `${d.b}+${d.m}×${d.x}=${d.b+d.m*d.x}.`); step('Answer', `Total = ${ans}`); }
  else if (t === 'm5_intersect') { step('Concept', `Different slopes → exactly 1 intersection.`); step('Answer', `${ans}`); }
  else if (t === 'm6_verify') { step('Check', `${d.x}+${d.y}=${d.x+d.y}. ✓`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm6_count') { step('Identify', `x and y → 2 unknowns.`); step('Answer', `${ans}`); }
  else if (t === 'm6_easy') { step('Solve', `x=${d.x}.`); step('Answer', `x = ${ans}`); }
  else if (t === 'm6_solve') { step('Solve', `x=${d.x}.`); step('Answer', `x = ${ans}`); }
  else if (t === 'm6_matrix') { step('Compute', `det=2(2)−3(1)=1.`); step('Answer', `det = ${ans}`); }
  else if (t === 'm6_unique') { step('Rule', `Unique when det≠0.`); step('Answer', `nonzero`); }
  else if (t === 'm6_2x2' || t === 'm6_2x2y') { step('Solve', `x=${d.x}, y=${d.y}.`); step('Answer', `${t==='m6_2x2'?'x':'y'} = ${ans}`); }
  else if (t === 'm6_det') { step('Compute', `det(A) = ${d.det}.`); step('Answer', `det = ${ans}`); }
  else if (t === 'm7_invert') { step('Invert', `f⁻¹(y)=y/${d.a}.`); step('Compute', `f⁻¹(${d.a*d.x})=${d.x}.`); step('Answer', `${ans}`); }
  else if (t === 'm7_oneone') { step('Concept', `ax+b (a≠0) is always one-to-one.`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm7_formula') { step('Invert', `y=${d.a}x → x=y/${d.a}.`); step('Answer', `f⁻¹(y)=y/${ans}`); }
  else if (t === 'm7_eval') { step('Compute', `f(${d.x})=${d.a*d.x+d.b}.`); step('Answer', `f(${d.x})=${ans}`); }
  else if (t === 'm7_inveq') { step('Compute', `f⁻¹(${3*d.a+d.b})=3.`); step('Answer', `${ans}`); }
  else if (t === 'm7_injective') { step('Definition', `Each y maps to exactly ONE x.`); step('Answer', `one`); }
  else if (t === 'm7_invformula') { step('Invert', `x=(y−${d.b})/${d.a}.`); step('Answer', `f⁻¹(y)=(y−${d.b})/${ans}`); }
  else if (t === 'm7_identity') { step('Concept', `f(f⁻¹(x))=x always.`); step('Answer', `x`); }
  else if (t === 'm7_comp') { step('Compute', `f(g(${d.x}))=${d.x}.`); step('Answer', `${ans}`); }
  else if (t === 'm8_square') { step('Compute', `(${d.x})²=${d.x*d.x}.`); step('Answer', `f(${d.x})=${ans}`); }
  else if (t === 'm8_quad') { step('Compute', `(${d.x})²−${d.a}=${d.x*d.x-d.a}.`); step('Answer', `f(${d.x})=${ans}`); }
  else if (t === 'm8_fzero') { step('Compute', `3²−9=0.`); step('Answer', `f(3)=${ans}`); }
  else if (t === 'm8_invert') { step('Concept', `Parabola fails horizontal line test.`); step('Answer', `${ans} (No)`); }
  else if (t === 'm8_two') { step('Observe', `f(${d.x})=f(${-d.x})=${d.x*d.x}.`); step('Answer', `${ans} (No)`); }
  else if (t === 'm8_vertex') { step('Compute', `Vertex at x=0.`); step('Answer', `x = ${ans}`); }
  else if (t === 'm8_factored') { step('Discriminant', `Δ=${d.a*d.a-4*d.b}.`); step('Answer', `${ans} roots`); }
  else if (t === 'm8_symmetry') { step('Concept', `f(a)=f(−a) → symmetric about y-axis.`); step('Answer', `y-axis`); }
  else if (t === 'm8_restrict') { step('Concept', `x≥0 makes it one-to-one.`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm9_quad') { step('Solve', `x=±${d.x}.`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm9_intersects') { step('Compute', `x=±${d.a} → 2 points.`); step('Answer', `${ans}`); }
  else if (t === 'm9_posneg') { step('Solve', `x=${d.x}.`); step('Answer', `x = ${ans}`); }
  else if (t === 'm9_both') { step('Solve', `x=±${d.x}.`); step('Answer', `x = ${ans}`); }
  else if (t === 'm9_fail') { step('Concept', `f(a)=f(−a) for a≠0.`); step('Answer', `horizontal line test`); }
  else if (t === 'm9_real') { step('Analyze', `x²=−${d.a}<0, no real roots.`); step('Answer', `${ans}`); }
  else if (t === 'm9_formula') { step('Solve', `x=${d.a}.`); step('Answer', `x = ${ans}`); }
  else if (t === 'm9_shifted') { step('Compute', `(${d.a+3}−${d.a})²=9.`); step('Answer', `f(${d.a+3})=${ans}`); }
  else if (t === 'm9_discrim') { step('Interpret', `Δ=${d.d}>0 → 2 real roots.`); step('Answer', `2 roots`); }
  else if (t === 'm10_cubic') { step('Compute', `(${d.x})³=${d.x*d.x*d.x}.`); step('Answer', `f(${d.x})=${ans}`); }
  else if (t === 'm10_degree') { step('Concept', `Cubic has max 3 real roots.`); step('Answer', `${ans}`); }
  else if (t === 'm10_cube_root') { step('Solve', `x=∛${d.x*d.x*d.x}=${d.x}.`); step('Answer', `x = ${ans}`); }
  else if (t === 'm10_onesol') { step('Concept', `x³ strictly increasing → 1 solution.`); step('Answer', `${ans}`); }
  else if (t === 'm10_positive') { step('Concept', `x³ strictly increasing → 1 positive root.`); step('Answer', `${ans}`); }
  else if (t === 'm10_odd') { step('Concept', `Odd degree → goes from −∞ to +∞.`); step('Answer', `crosses x-axis`); }
  else if (t === 'm10_factor') { step('Factor', `x(x−1)(x+1)=0.`); step('Answer', `${ans} roots`); }
  else if (t === 'm10_complex') { step('Degree', `Degree 3 → 3 roots total.`); step('Answer', `${ans}`); }
  else if (t === 'm10_sum') { step('Factor', `(x−3)(x²+3x+9)=0. Δ<0.`); step('Answer', `${ans} root`); }
  else if (t === 'm11_r3') { step('Definition', `R³ → 3 coordinates.`); step('Answer', `${ans}`); }
  else if (t === 'm11_r2') { step('Definition', `Plane → 2 coordinates.`); step('Answer', `${ans}`); }
  else if (t === 'm11_r1') { step('Definition', `Line → 1 coordinate.`); step('Answer', `${ans}`); }
  else if (t === 'm11_vecdim') { step('Count', `3 components → R³.`); step('Answer', `R³`); }
  else if (t === 'm11_notation') { step('Definition', `2D plane = R².`); step('Answer', `R²`); }
  else if (t === 'm11_5d') { step('Concept', `5 measurements → R⁵.`); step('Answer', `R⁵`); }
  else if (t === 'm11_nd') { step('Definition', `n components.`); step('Answer', `${ans}`); }
  else if (t === 'm11_origin') { step('Concept', `Point is 0D.`); step('Answer', `${ans}`); }
  else if (t === 'm11_span') { step('Concept', `1 vector → line (1D).`); step('Answer', `${ans}`); }
  else if (t === 'm12_col1') { step('Concept', `First column = image of (1,0).`); step('Answer', `(${ans})`); }
  else if (t === 'm12_col2') { step('Concept', `Second column = image of (0,1).`); step('Answer', `(${ans})`); }
  else if (t === 'm12_linear') { step('Definition', `Always linear.`); step('Answer', `linear`); }
  else if (t === 'm12_apply') { step('Compute', `A·(1,0) = first column.`); step('Answer', `First column`); }
  else if (t === 'm12_det') { step('Compute', `det=${d.det}. Non-zero → invertible.`); step('Answer', `det=${d.det}`); }
  else if (t === 'm12_cols') { step('Definition', `Images of standard basis.`); step('Answer', `standard basis`); }
  else if (t === 'm12_comp') { step('Compute', `(${d.A[0][0]*d.x+d.A[0][1]*d.y}, ${d.A[1][0]*d.x+d.A[1][1]*d.y}).`); step('Answer', `= (${d.r})`); }
  else if (t === 'm12_2x2') { step('Concept', `Maps R²→R².`); step('Answer', `${ans}`); }
  else if (t === 'm12_identity') { step('Concept', `I·v = v.`); step('Answer', `v`); }
  else if (t === 'm13_detdiag') { step('Compute', `${d.a}×${d.d}=${d.a*d.d}.`); step('Answer', `det = ${ans}`); }
  else if (t === 'm13_zero') { step('Compute', `1×4−2×2=0.`); step('Answer', `det=0, singular`); }
  else if (t === 'm13_prod') { step('Property', `Product of diagonal entries.`); step('Answer', `diagonal entries`); }
  else if (t === 'm13_det') { step('Compute', `det=${d.det}.`); step('Answer', `det = ${ans}`); }
  else if (t === 'm13_invert') { step('Rule', `det≠0 → invertible.`); step('Answer', `${d.det!==0?'Yes':'No'}`); }
  else if (t === 'm13_formula') { step('Formula', `det = ad−bc.`); step('Answer', `ad−bc`); }
  else if (t === 'm13_singular') { step('Concept', `det=0 → rank < n.`); step('Answer', `rank < full`); }
  else if (t === 'm13_inverse_det') { step('Property', `det(A⁻¹)=1/det(A)=${1/d.det}.`); step('Answer', `${ans}`); }
  else if (t === 'm13_connection') { step('Rule', `A invertible ⟺ det≠0.`); step('Answer', `${d.det!==0?'Yes':'No'}`); }
  else if (t === 'm14_det0') { step('Concept', `Singular matrix.`); step('Answer', `singular`); }
  else if (t === 'm14_kernel') { step('Definition', `Kernel = null space.`); step('Answer', `null space`); }
  else if (t === 'm14_zero') { step('Check', `A·0=0 always.`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm14_sing') { step('Concept', `Collapses nonzero vectors to zero.`); step('Answer', `zero vector`); }
  else if (t === 'm14_ns_dir') { step('Solve', `x+2y=0 → (−2,1).`); step('Answer', `(${ans})`); }
  else if (t === 'm14_many') { step('Concept', `Null space is a line → infinite.`); step('Answer', `infinitely many`); }
  else if (t === 'm14_ns_calc') { step('Compute', `nullity = n − rank.`); step('Answer', `nullity = ${ans}`); }
  else if (t === 'm14_nsr') { step('Theorem', `nullity+rank=n.`); step('Answer', `= n`); }
  else if (t === 'm14_verify') { step('Check', `(1,2)·(−2,1)=−2+2=0.`); step('Answer', `= 0`); }
  else if (t === 'm15_mult') { step('Concept', `Encrypts by matrix multiplication.`); step('Answer', `multiplication`); }
  else if (t === 'm15_mod') { step('Concept', `Uses mod 26.`); step('Answer', `26`); }
  else if (t === 'm15_decrypt') { step('Concept', `Multiply by A⁻¹.`); step('Answer', `inverse`); }
  else if (t === 'm15_apply') { step('Compute', `${d.A[0][0]}×${d.v[0]}+${d.A[0][1]}×${d.v[1]}=${d.r[0]}.`); step('Answer', `= ${ans}`); }
  else if (t === 'm15_det') { step('Rule', `det≠0 (mod26) → decryptable.`); step('Answer', `${d.det!==0?'Yes':'No'}`); }
  else if (t === 'm15_identity') { step('Compute', `I·v=v, unchanged.`); step('Answer', `${ans}`); }
  else if (t === 'm15_hill_det') { step('Compute', `det=${d.det}.`); step('Answer', `${d.det!==0?'Yes':'No'}`); }
  else if (t === 'm15_2x2') { step('Concept', `2×2 matrices.`); step('Answer', `2×2`); }
  else if (t === 'm15_encrypt') { step('Compute', `3×18+4×20=134.`); step('Answer', `= ${ans}`); }
  else if (t === 'm16_count') { step('Count', `2 equations.`); step('Answer', `${ans}`); }
  else if (t === 'm16_over') { step('Definition', `More equations → overdetermined.`); step('Answer', `over`); }
  else if (t === 'm16_easy') { step('Solve', `A=${d.x}.`); step('Answer', `A = ${ans}`); }
  else if (t === 'm16_solve') { step('Solve', `A=${d.x}.`); step('Answer', `A = ${ans}`); }
  else if (t === 'm16_leastsq') { step('Concept', `Least squares method.`); step('Answer', `least squares`); }
  else if (t === 'm16_verify') { step('Check', `Both equations satisfied. ✓`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm16_atb') { step('Transpose', `3×2 → 2×3.`); step('Answer', `2×3`); }
  else if (t === 'm16_ata') { step('Compute', `Entry (1,1) = 11.`); step('Answer', `= ${d.ATA?d.ATA[0][0]:11}`); }
  else if (t === 'm16_overdet') { step('Count', `3 equations, 2 unknowns.`); step('Answer', `${ans}`); }
  else if (t === 'm17_steady') { step('Definition', `Probs stop changing.`); step('Answer', `changing`); }
  else if (t === 'm17_matrix') { step('Definition', `Maps current → next state.`); step('Answer', `next`); }
  else if (t === 'm17_sum') { step('Rule', `Rows sum to 1.`); step('Answer', `1`); }
  else if (t === 'm17_step') { step('Compute', `Row 1 · [1,0] = ${d.P?d.P[0][0]:'?'}.`); step('Answer', `= ${d.P?d.P[0][0]:'?'}`); }
  else if (t === 'm17_steady_eq') { step('Definition', `πP = π.`); step('Answer', `πP = π`); }
  else if (t === 'm17_rows') { step('Compute', `Row 1 sums to 1.`); step('Answer', `1`); }
  else if (t === 'm17_calc') { step('Concept', `π₁+π₂=1.`); step('Answer', `${ans}`); }
  else if (t === 'm17_eigen') { step('Property', `Dominant eigenvalue = 1.`); step('Answer', `1`); }
  else if (t === 'm17_det') { step('Compute', `det(P).`); step('Answer', `det = ${ans}`); }
  else if (t === 'm18_rows') { step('Count', `3 rows.`); step('Answer', `${ans}`); }
  else if (t === 'm18_cols') { step('Count', `2 columns.`); step('Answer', `${ans}`); }
  else if (t === 'm18_type') { step('Definition', `Overdetermined.`); step('Answer', `over`); }
  else if (t === 'm18_exact') { step('Concept', `Usually no exact solution.`); step('Answer', `${ans}`); }
  else if (t === 'm18_intersect') { step('Concept', `One point typically.`); step('Answer', `${ans}`); }
  else if (t === 'm18_3lines') { step('Concept', `Rarely concurrent.`); step('Answer', `${ans}`); }
  else if (t === 'm18_least') { step('Definition', `Least squares.`); step('Answer', `least squares`); }
  else if (t === 'm18_transpose') { step('Compute', `3×2 → 2×3.`); step('Answer', `2×3`); }
  else if (t === 'm18_ata_det') { step('Compute', `66−36=30.`); step('Answer', `${ans}`); }
  else if (t === 'm19_intersect') { step('Concept', `One point.`); step('Answer', `${ans}`); }
  else if (t === 'm19_parallel') { step('Concept', `Zero points.`); step('Answer', `${ans}`); }
  else if (t === 'm19_three') { step('Definition', `Concurrent.`); step('Answer', `concurrent`); }
  else if (t === 'm19_unlikely') { step('Concept', `Very unlikely.`); step('Answer', `unlikely`); }
  else if (t === 'm19_geometric') { step('Concept', `Lines don't all intersect.`); step('Answer', `intersect`); }
  else if (t === 'm19_residual') { step('Concept', `Minimum residual.`); step('Answer', `residual`); }
  else if (t === 'm19_atb') { step('Compute', `3×2 → 2×3 → A^T A is 2×2.`); step('Answer', `2×2`); }
  else if (t === 'm19_ata_det') { step('Compute', `66−36=30.`); step('Answer', `${ans}`); }
  else if (t === 'm19_rows') { step('Concept', `A has 3 cols → A^T has 3 rows.`); step('Answer', `${ans}`); }
  else if (t === 'm20_prob') { step('Rule', `Between 0 and 1.`); step('Answer', `1`); }
  else if (t === 'm20_rows') { step('Rule', `Sum to 1.`); step('Answer', `1`); }
  else if (t === 'm20_state') { step('Concept', `2×2 matrix.`); step('Answer', `2×2`); }
  else if (t === 'm20_step') { step('Compute', `First entry = ${d.P?d.P[0][0]:'?'}.`); step('Answer', `= ${d.P?d.P[0][0]:'?'}`); }
  else if (t === 'm20_steady') { step('Definition', `πP=π.`); step('Answer', `π`); }
  else if (t === 'm20_indep') { step('Property', `Independent of start.`); step('Answer', `${ans}`); }
  else if (t === 'm20_det') { step('Compute', `det(P).`); step('Answer', `det = ${ans}`); }
  else if (t === 'm20_multi') { step('Property', `Unique steady state.`); step('Answer', `${ans}`); }
  else if (t === 'm20_eigen') { step('Property', `Eigenvalue = 1.`); step('Answer', `1`); }
  else if (t === 'm21_states') { step('Concept', `3×3 matrix.`); step('Answer', `3×3`); }
  else if (t === 'm21_equations') { step('Concept', `Need equations for each state.`); step('Answer', `${ans}`); }
  else if (t === 'm21_norm') { step('Rule', `Sum to 1.`); step('Answer', `1`); }
  else if (t === 'm21_power') { step('Concept', `Matrix powers converge.`); step('Answer', `${ans}`); }
  else if (t === 'm21_indep2') { step('Property', `Same steady state.`); step('Answer', `${ans}`); }
  else if (t === 'm21_sum') { step('Rule', `Rows sum to 1.`); step('Answer', `1`); }
  else if (t === 'm21_row_sum') { step('Rule', `Row sums = 1.`); step('Answer', `1`); }
  else if (t === 'm21_converge') { step('Property', `Converges to steady state.`); step('Answer', `steady`); }
  else if (t === 'm22_dot') { step('Compute', `${d.a}×0+0×${d.b}=0.`); step('Answer', `= ${ans}`); }
  else if (t === 'm22_perp') { step('Property', `Dot = 0.`); step('Answer', `0`); }
  else if (t === 'm22_self') { step('Compute', `${d.a}²+${d.a}²=${2*d.a*d.a}.`); step('Answer', `= ${ans}`); }
  else if (t === 'm22_eq') { step('Set up', `${d.a}x+${d.b}y=0.`); step('Answer', `${d.a}x+${d.b}y=0`); }
  else if (t === 'm22_perpvec') { step('Compute', `Dot = ${d.u[0]*d.v[0]+d.u[1]*d.v[1]}.`); step('Answer', `= ${d.u[0]*d.v[0]+d.u[1]*d.v[1]}`); }
  else if (t === 'm22_zero') { step('Check', `(0,0)·v=0.`); step('Answer', `${ans} (Yes)`); }
  else if (t === 'm22_check') { step('Compute', `Dot = ${d.a*d.c+d.b*d.d}.`); step('Answer', `= ${d.a*d.c+d.b*d.d}`); }
  else if (t === 'm22_dim') { step('Concept', `1D perpendicular complement.`); step('Answer', `${ans}`); }
  else if (t === 'm22_angle') { step('Compute', `Dot = ${d.u[0]*d.v[0]+d.u[1]*d.v[1]}.`); step('Answer', `= ${d.u[0]*d.v[0]+d.u[1]*d.v[1]}`); }
  else if (t === 'm23_plane') { step('Concept', `Equation in R³ → plane.`); step('Answer', `plane`); }
  else if (t === 'm23_3d') { step('Definition', `3 coordinates.`); step('Answer', `${ans}`); }
  else if (t === 'm23_check') { step('Compute', `2+14+9=25≠0.`); step('Answer', `${ans} (No)`); }
  else if (t === 'm23_line') { step('Concept', `2 equations → line.`); step('Answer', `${ans}`); }
  else if (t === 'm23_normal') { step('Concept', `Normal = (a,b,c).`); step('Answer', `(${d.a},${d.b},${d.c})`); }
  else if (t === 'm23_perp2') { step('Concept', `Plane is 2D.`); step('Answer', `${ans}`); }
  else if (t === 'm23_3dot') { step('Compute', `Dot = ${d.a*d.d+d.b*d.e+d.c*d.f}.`); step('Answer', `= ${d.a*d.d+d.b*d.e+d.c*d.f}`); }
  else if (t === 'm23_check2') { step('Compute', `= ${d.x+2*d.y+3*d.z}.`); step('Answer', `= ${d.x+2*d.y+3*d.z}`); }
  else if (t === 'm23_3planes') { step('Concept', `Each equation removes 1 dimension.`); step('Answer', `${ans}`); }
  else { _genericExplanation(t, d, s, step, ans); }
  return s;
  } catch {
    return [{ label: 'Answer', text: q.display || q.answer || 'See answer above' }];
  }
}

function _genericExplanation(t, d, s, step, ans) {
  if (t.startsWith('m24_') || t.startsWith('m25_') || t.startsWith('m26_') || t.startsWith('m27_') || t.startsWith('m28_') || t.startsWith('m29_') || t.startsWith('m30_') || t.startsWith('m31_') || t.startsWith('m32_') || t.startsWith('m33_') || t.startsWith('m34_') || t.startsWith('m35_') || t.startsWith('m36_')) {
    if (t === 'm24_free') { step('Compute', `3−2=1 free variable.`); step('Answer', `${ans}`); }
    else if (t === 'm24_null') { step('Definition', `Kernel = null space.`); step('Answer', `kernel`); }
    else if (t === 'm24_perp') { step('Property', `NS ⊥ RS.`); step('Answer', `row space`); }
    else if (t === 'm24_direction') { step('Compute', `1 free var → 1D.`); step('Answer', `1`); }
    else if (t === 'm24_span') { step('Span', `1 vector in R³ → line.`); step('Answer', `line`); }
    else if (t === 'm24_plane') { step('Span', `2 indep vectors → plane.`); step('Answer', `plane`); }
    else if (t === 'm24_rn') { step('Rank-nullity', `= n columns.`); step('Answer', `columns`); }
    else if (t === 'm24_null_check') { step('Compute', `nullity=3−${d.r}=${3-d.r}.`); step('Answer', `${ans}`); }
    else if (t === 'm24_dim') { step('Compute', `dim=3−${d.r}=${3-d.r}.`); step('Answer', `${ans}`); }
    else if (t === 'm25_rank') { step('Compute', `Rank = 2.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm25_sing') { step('Definition', `rank < n → singular.`); step('Answer', `singular`); }
    else if (t === 'm25_det') { step('Compute', `det = 0.`); step('Answer', `det = ${ans}`); }
    else if (t === 'm25_ns_dir') { step('Find', `(1,−2,1).`); step('Answer', `(${ans})`); }
    else if (t === 'm25_nullity') { step('Compute', `3−2=1.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm25_perp') { step('Property', `NS ⊥ RS.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm25_check') { step('Compute', `1−4+3=0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm25_rank_null') { step('Compute', `nullity = 1.`); step('Answer', `${ans}`); }
    else if (t === 'm25_null_dim') { step('Compute', `dim = 3−${d.r}=${3-d.r}.`); step('Answer', `${ans}`); }
    else if (t === 'm26_rank') { step('Compute', `rank = 2.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm26_dim_row') { step('Property', `dim(RS) = rank.`); step('Answer', `rank`); }
    else if (t === 'm26_dim_col') { step('Property', `dim(CS) = rank.`); step('Answer', `rank`); }
    else if (t === 'm26_span') { step('Property', `R⊕N = Rⁿ.`); step('Answer', `Rⁿ`); }
    else if (t === 'm26_orthogonal') { step('Property', `RS ⊥ NS.`); step('Answer', `orthogonal`); }
    else if (t === 'm26_dim_sum') { step('Rank-nullity', `= n columns.`); step('Answer', `columns`); }
    else if (t === 'm26_det') { step('Compute', `rank=${d.det!==0?2:1}.`); step('Answer', `rank = ${d.det!==0?2:1}`); }
    else if (t === 'm26_sum') { step('Compute', `${d.r}+${d.n}=${d.r+d.n}.`); step('Answer', `${ans}`); }
    else if (t === 'm26_dim') { step('Compute', `R=2D, N=1D.`); step('Answer', `R:2D, N:1D`); }
    else if (t === 'm27_det') { step('Compute', `4−4=0.`); step('Answer', `det = ${ans}`); }
    else if (t === 'm27_rank') { step('Compute', `R2=2R1 → rank=1.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm27_collapse') { step('Concept', `2D→1D.`); step('Answer', `${ans}`); }
    else if (t === 'm27_apply') { step('Compute', `(${d.x+2*d.y},${2*d.x+4*d.y}).`); step('Answer', `(${d.r})`); }
    else if (t === 'm27_parallel') { step('Concept', `Collapse to same point.`); step('Answer', `${ans}`); }
    else if (t === 'm27_null_dir') { step('Find', `(−2,1).`); step('Answer', `(${ans})`); }
    else if (t === 'm27_line_k') { step('Compute', `→ (${d.k},${2*d.k}).`); step('Answer', `(${d.k},${2*d.k})`); }
    else if (t === 'm27_result') { step('Compute', `(${d.v[0]+2*d.v[1]},${2*d.v[0]+4*d.v[1]}).`); step('Answer', `(${d.r})`); }
    else if (t === 'm27_dim_in_out') { step('Concept', `→ 0D point.`); step('Answer', `0D`); }
    else if (t === 'm28_plane') { step('Concept', `2 vectors → plane.`); step('Answer', `${ans}`); }
    else if (t === 'm28_origin') { step('Concept', `0·v=0.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm28_one') { step('Span', `→ line.`); step('Answer', `line`); }
    else if (t === 'm28_scalar') { step('Concept', `Scalar multiples → line.`); step('Answer', `line`); }
    else if (t === 'm28_indep') { step('Concept', `2 indep → plane.`); step('Answer', `plane`); }
    else if (t === 'm28_r3') { step('Concept', `Need 3.`); step('Answer', `${ans}`); }
    else if (t === 'm28_dim_check') { step('Compute', `min(${d.a},${d.b}).`); step('Answer', `min(${d.a},${d.b})`); }
    else if (t === 'm28_3vec') { step('Concept', `→ R³.`); step('Answer', `${ans}`); }
    else if (t === 'm28_dim_dep') { step('Concept', `< 3.`); step('Answer', `${ans}`); }
    else if (t === 'm29_intersect') { step('Concept', `2 planes → line.`); step('Answer', `line`); }
    else if (t === 'm29_null') { step('Property', `NS ⊥ plane.`); step('Answer', `perpendicular`); }
    else if (t === 'm29_3d') { step('Definition', `1 equation.`); step('Answer', `${ans}`); }
    else if (t === 'm29_normal') { step('Concept', `Normal = (${d.a},${d.b},${d.c}).`); step('Answer', `(${d.a},${d.b},${d.c})`); }
    else if (t === 'm29_ns_line') { step('Compute', `3−2=1 → line.`); step('Answer', `line`); }
    else if (t === 'm29_perp') { step('Property', `Always ⊥.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm29_dim') { step('Compute', `3−2=1.`); step('Answer', `dim = ${ans}`); }
    else if (t === 'm29_rank_null') { step('Compute', `rank = 3−1=2.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm29_cross') { step('Compute', `Cross product first component.`); step('Answer', `${d.cp?d.cp[0]:'compute'}`); }
    else if (t === 'm30_det') { step('Compute', `det = 0.`); step('Answer', `det = ${ans}`); }
    else if (t === 'm30_rank') { step('Compute', `rank = 2.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm30_ns') { step('Find', `(1,−2,1).`); step('Answer', `(${ans})`); }
    else if (t === 'm30_nullity') { step('Compute', `3−2=1.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm30_dep') { step('Concept', `Linearly dependent.`); step('Answer', `dependent`); }
    else if (t === 'm30_check') { step('Compute', `1−8+7=0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm30_perp') { step('Compute', `= 0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm30_indep') { step('Concept', `Spanned by 2 vectors.`); step('Answer', `${ans}`); }
    else if (t === 'm30_sum') { step('Rank-nullity', `= columns.`); step('Answer', `columns`); }
    else if (t === 'm31_rank') { step('Compute', `rank = 2.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm31_nullity') { step('Compute', `nullity = 1.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm31_same') { step('Property', `= rank.`); step('Answer', `rank`); }
    else if (t === 'm31_dim_row') { step('Compute', `= 2.`); step('Answer', `${ans}`); }
    else if (t === 'm31_dim_null') { step('Compute', `= 1.`); step('Answer', `${ans}`); }
    else if (t === 'm31_col') { step('Compute', `= 2.`); step('Answer', `${ans}`); }
    else if (t === 'm31_rank_null') { step('Compute', `${d.r}+${d.n}=${d.r+d.n}.`); step('Answer', `${ans}`); }
    else if (t === 'm31_count') { step('Definition', `4 subspaces.`); step('Answer', `${ans}`); }
    else if (t === 'm31_dim_check') { step('Compute', `Input = R².`); step('Answer', `R²`); }
    else if (t === 'm32_dot1') { step('Compute', `1−8+7=0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm32_perp') { step('Definition', `Dot=0 → ⊥.`); step('Answer', `perpendicular`); }
    else if (t === 'm32_theorem') { step('Theorem', `RS ⊥ NS.`); step('Answer', `perpendicular`); }
    else if (t === 'm32_check2') { step('Compute', `4−10+6=0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm32_all') { step('Property', `Always 0.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm32_why') { step('Concept', `Ax=0 → row·x=0.`); step('Answer', `0`); }
    else if (t === 'm32_dot') { step('Compute', `7−16+9=0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm32_sum') { step('Compute', `${d.r}+(${d.n}−${d.r})=${d.n}.`); step('Answer', `= ${ans}`); }
    else if (t === 'm32_sum2') { step('Compute', `(${d.m}−${d.r})+${d.r}=${d.m}.`); step('Answer', `= ${ans}`); }
    else if (t === 'm33_det') { step('Compute', `det = 0.`); step('Answer', `det = ${ans}`); }
    else if (t === 'm33_line') { step('Compute', `→ (4,8).`); step('Answer', `(${ans})`); }
    else if (t === 'm33_nonsing') { step('Concept', `No collapse.`); step('Answer', `${ans} (No)`); }
    else if (t === 'm33_apply') { step('Compute', `B·(0,2)=(4,8).`); step('Answer', `(${ans})`); }
    else if (t === 'm33_all_same') { step('Concept', `Differ by NS vectors.`); step('Answer', `NS vectors`); }
    else if (t === 'm33_range') { step('Definition', `In range/CS.`); step('Answer', `range`); }
    else if (t === 'm33_intercept') { step('Compute', `Sum = ${d.k+d.k/2}.`); step('Answer', `${d.k+d.k/2}`); }
    else if (t === 'm33_rank') { step('Compute', `rank = 1.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm34_k10') { step('Compute', `→ (10,20).`); step('Answer', `(${ans})`); }
    else if (t === 'm34_k62') { step('Compute', `→ (62,124).`); step('Answer', `(${ans})`); }
    else if (t === 'm34_diff') { step('Concept', `Different k → different output.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm34_formula') { step('Compute', `→ (${d.k},${2*d.k}).`); step('Answer', `(${d.k},${2*d.k})`); }
    else if (t === 'm34_pattern') { step('Pattern', `k→(k,2k).`); step('Answer', `(1,2)`); }
    else if (t === 'm34_parallel') { step('Concept', `Unique output.`); step('Answer', `different`); }
    else if (t === 'm34_apply') { step('Compute', `(${d.A[0][0]*d.x+d.A[0][1]*d.y},${d.A[1][0]*d.x+d.A[1][1]*d.y}).`); step('Answer', `(${d.r})`); }
    else if (t === 'm34_rank') { step('Compute', `dim = 1.`); step('Answer', `dim = ${ans}`); }
    else if (t === 'm34_check') { step('Compute', `= ${d.x+2*d.y}.`); step('Answer', `= ${d.x+2*d.y}`); }
    else if (t === 'm35_ns') { step('Find', `(−2,1).`); step('Answer', `(${ans})`); }
    else if (t === 'm35_range') { step('Find', `(1,2).`); step('Answer', `(${ans})`); }
    else if (t === 'm35_perp') { step('Check', `−2+2=0.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm35_formula') { step('Compute', `→ (${d.k},${2*d.k}).`); step('Answer', `(${d.k},${2*d.k})`); }
    else if (t === 'm35_ns_range') { step('Compute', `= 0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm35_collapse') { step('Compute', `(k,2k).`); step('Answer', `${ans}`); }
    else if (t === 'm35_output') { step('Compute', `= ${d.A[1][0]*d.x+d.A[1][1]*d.y}.`); step('Answer', `= ${d.A[1][0]*d.x+d.A[1][1]*d.y}`); }
    else if (t === 'm35_rank1') { step('Compute', `rank = 1.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm35_det') { step('Compute', `det = 0.`); step('Answer', `det = ${ans}`); }
    else if (t === 'm36_rank') { step('Compute', `rank = 1.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm36_nullity') { step('Compute', `nullity = 1.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm36_sum') { step('Compute', `1+1=2.`); step('Answer', `= ${ans}`); }
    else if (t === 'm36_ftoc') { step('Rank-nullity', `= columns.`); step('Answer', `columns`); }
    else if (t === 'm36_dim_in') { step('Compute', `2−1=1.`); step('Answer', `${ans}`); }
    else if (t === 'm36_dim_out') { step('Compute', `rank = 1.`); step('Answer', `${ans}`); }
    else if (t === 'm36_general') { step('Compute', `nullity = ${d.n}−${d.r}=${d.n-d.r}.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm36_identity') { step('Compute', `0 lost.`); step('Answer', `${ans}`); }
    else if (t === 'm36_zero') { step('Compute', `All lost.`); step('Answer', `${ans}`); }
    else { step('Answer', `Correct answer: ${ans}`); }
  }
  else if (t.startsWith('m37_') || t.startsWith('m38_') || t.startsWith('m39_') || t.startsWith('m40_') || t.startsWith('m41_') || t.startsWith('m42_') || t.startsWith('m43_') || t.startsWith('m44_') || t.startsWith('m45_')) {
    if (t === 'm37_rank') { step('Compute', `R2=3R1 → rank=1.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm37_row_dir') { step('Find', `(1,2).`); step('Answer', `(${ans})`); }
    else if (t === 'm37_col_dir') { step('Find', `(1,3).`); step('Answer', `(${ans})`); }
    else if (t === 'm37_null_dir') { step('Find', `(−2,1).`); step('Answer', `(${ans})`); }
    else if (t === 'm37_all_1d') { step('Compute', `All 1D.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm37_dim_sum') { step('Compute', `1+1=2.`); step('Answer', `= ${ans}`); }
    else if (t === 'm37_verify') { step('Compute', `−2+2=0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm37_det_check') { step('Compute', `det=${d.det}.`); step('Answer', `${d.det!==0?'Yes':'No'}`); }
    else if (t === 'm37_dim_check') { step('Compute', `1+1=2.`); step('Answer', `= ${ans}`); }
    else if (t === 'm38_dot') { step('Compute', `−3+3=0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm38_perp') { step('Property', `Always ⊥.`); step('Answer', `orthogonal`); }
    else if (t === 'm38_zero') { step('Concept', `0 is in all.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm38_row') { step('Compute', `span(1,2).`); step('Answer', `span(1,2)`); }
    else if (t === 'm38_null') { step('Compute', `span(−2,1).`); step('Answer', `span(−2,1)`); }
    else if (t === 'm38_sum') { step('Rank-nullity', `= columns.`); step('Answer', `columns`); }
    else if (t === 'm38_verify_any') { step('Compute', `= 0.`); step('Answer', `= 0`); }
    else if (t === 'm38_sum_check') { step('Compute', `${d.r}+(${d.n}−${d.r})=${d.n}.`); step('Answer', `= ${ans}`); }
    else if (t === 'm38_which') { step('Concept', `R³.`); step('Answer', `R³`); }
    else if (t === 'm39_nm') { step('Find', `span(−2,1).`); step('Answer', `span(−2,1)`); }
    else if (t === 'm39_nmt') { step('Find', `span(3,−1).`); step('Answer', `span(3,−1)`); }
    else if (t === 'm39_diff') { step('Concept', `Different spaces.`); step('Answer', `different`); }
    else if (t === 'm39_perp_cm') { step('Property', `N(M^T) ⊥ C(M).`); step('Answer', `column space`); }
    else if (t === 'm39_dim_nm') { step('Compute', `2−1=1.`); step('Answer', `${ans}`); }
    else if (t === 'm39_dim_nmt') { step('Compute', `2−1=1.`); step('Answer', `${ans}`); }
    else if (t === 'm39_verify') { step('Compute', `−3+3=0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm39_dim_check') { step('Compute', `(${d.m}−${d.r})+${d.r}=${d.m}.`); step('Answer', `= ${ans}`); }
    else if (t === 'm40_c_perp') { step('Property', `C ⊥ N^T.`); step('Answer', `N(A^T)`); }
    else if (t === 'm40_r_perp') { step('Property', `R ⊥ N.`); step('Answer', `N(A)`); }
    else if (t === 'm40_pairs') { step('Count', `2 pairs.`); step('Answer', `${ans}`); }
    else if (t === 'm40_input') { step('Concept', `Rⁿ.`); step('Answer', `input`); }
    else if (t === 'm40_output') { step('Concept', `Rᵐ.`); step('Answer', `output`); }
    else if (t === 'm40_four') { step('Definition', `R, N, C, N^T.`); step('Answer', `R,N,C,N^T`); }
    else if (t === 'm40_dim_check') { step('Compute', `= ${d.n}.`); step('Answer', `= ${ans}`); }
    else if (t === 'm40_dim_check2') { step('Compute', `= ${d.m}.`); step('Answer', `= ${ans}`); }
    else if (t === 'm40_dim_sum') { step('Compute', `${d.r}+(2−${d.r})=2.`); step('Answer', `= ${ans}`); }
    else if (t === 'm41_rank') { step('Compute', `rank = 2.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm41_ns') { step('Find', `(1,−2,1).`); step('Answer', `(${ans})`); }
    else if (t === 'm41_dim_r') { step('Compute', `= 2.`); step('Answer', `${ans}`); }
    else if (t === 'm41_subspaces') { step('Compute', `R:2D, N:1D.`); step('Answer', `R:2D, N:1D`); }
    else if (t === 'm41_col') { step('Compute', `= 2D.`); step('Answer', `${ans}`); }
    else if (t === 'm41_lns') { step('Compute', `3−2=1.`); step('Answer', `${ans}`); }
    else if (t === 'm41_types') { step('Compute', `2+1=3.`); step('Answer', `= ${ans}`); }
    else if (t === 'm41_sum') { step('Compute', `${d.r}+(${d.n}−${d.r})=${d.n}.`); step('Answer', `= ${ans}`); }
    else if (t === 'm41_verify') { step('Compute', `1−8+7=0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm42_i4') { step('Compute', `rank = 4.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm42_zero') { step('Compute', `rank = 0.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm42_max') { step('Compute', `min(4,4)=4.`); step('Answer', `${ans}`); }
    else if (t === 'm42_range') { step('Definition', `= dim(CS).`); step('Answer', `column space`); }
    else if (t === 'm42_rank1') { step('Compute', `= 1D.`); step('Answer', `${ans}`); }
    else if (t === 'm42_rank2') { step('Compute', `4−2=2.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm42_nullity') { step('Compute', `4−${d.r}=${4-d.r}.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm42_rank3') { step('Compute', `R:3D, N:1D.`); step('Answer', `R:3D, N:1D`); }
    else if (t === 'm42_equiv') { step('Property', `rank(A)=rank(A^T).`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm43_line') { step('Property', `Closed under scalar mult.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm43_subspace') { step('Definition', `Always a subspace.`); step('Answer', `subspace`); }
    else if (t === 'm43_closed') { step('Definition', `+ and scalar mult.`); step('Answer', `scalar multiplication`); }
    else if (t === 'm43_prop') { step('Property', `Homogeneity.`); step('Answer', `homogeneity`); }
    else if (t === 'm43_line_in') { step('Property', `In the range.`); step('Answer', `range`); }
    else if (t === 'm43_zero') { step('Property', `A(0)=0.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm43_rank') { step('Compute', `rank=2.`); step('Answer', `rank = ${d.A||2}`); }
    else if (t === 'm43_rank_check') { step('Compute', `rank=1.`); step('Answer', `${ans}`); }
    else if (t === 'm44_add') { step('Property', `Closed under +.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm44_span2') { step('Concept', `→ plane.`); step('Answer', `plane`); }
    else if (t === 'm44_closure') { step('Definition', `+ and scalar mult.`); step('Answer', `scalar multiplication`); }
    else if (t === 'm44_prop') { step('Property', `Additivity.`); step('Answer', `additivity`); }
    else if (t === 'm44_span_range') { step('Property', `In range.`); step('Answer', `range`); }
    else if (t === 'm44_col') { step('Definition', `= CS.`); step('Answer', `column`); }
    else if (t === 'm44_dim') { step('Compute', `= rank.`); step('Answer', `= rank`); }
    else if (t === 'm44_dim_range') { step('Compute', `= 1.`); step('Answer', `${ans}`); }
    else if (t === 'm44_sub') { step('Concept', `In R³.`); step('Answer', `R³`); }
    else if (t === 'm45_dep') { step('Check', `(2,4,6)=2(1,2,3).`); step('Answer', `${ans} (No)`); }
    else if (t === 'm45_indep') { step('Check', `Not multiples.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm45_dim_dep') { step('Compute', `dim=1.`); step('Answer', `dim = ${ans}`); }
    else if (t === 'm45_span') { step('Compute', `→ 1D.`); step('Answer', `${ans}`); }
    else if (t === 'm45_indep2') { step('Compute', `→ 2D.`); step('Answer', `${ans}`); }
    else if (t === 'm45_dim') { step('Definition', `= # indep vectors.`); step('Answer', `independent`); }
    else if (t === 'm45_rank') { step('Compute', `= r.`); step('Answer', `= ${ans}`); }
    else if (t === 'm45_three') { step('Compute', `= 3.`); step('Answer', `dim = ${ans}`); }
    else if (t === 'm45_nullity') { step('Compute', `${d.n}−${d.r}=${d.n-d.r}.`); step('Answer', `nullity = ${ans}`); }
    else { step('Answer', `Correct answer: ${ans}`); }
  }
  else if (t.startsWith('m46_') || t.startsWith('m47_') || t.startsWith('m48_') || t.startsWith('m49_') || t.startsWith('m50_')) {
    if (t === 'm46_rn') { step('Concept', `Input space Rⁿ.`); step('Answer', `n`); }
    else if (t === 'm46_cm') { step('Concept', `Output space Rᵐ.`); step('Answer', `m`); }
    else if (t === 'm46_four') { step('Definition', `4 subspaces.`); step('Answer', `${ans}`); }
    else if (t === 'm46_rn_span') { step('Property', `R⊕N=Rⁿ.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm46_perp_pairs') { step('Property', `R⊥N, C⊥N^T.`); step('Answer', `R⊥N, C⊥N^T`); }
    else if (t === 'm46_dims') { step('Property', `= m.`); step('Answer', `m`); }
    else if (t === 'm46_calc') { step('Compute', `r+(n−r)=n=${d.n}.`); step('Answer', `= ${d.n}`); }
    else if (t === 'm46_calc2') { step('Compute', `(m−r)+r=m=${d.m}.`); step('Answer', `= ${d.m}`); }
    else if (t === 'm46_zero') { step('Compute', `nullity=0.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm47_dot1') { step('Compute', `1−8+7=0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm47_dot2') { step('Compute', `4−10+6=0.`); step('Answer', `= ${ans}`); }
    else if (t === 'm47_confirm') { step('Concept', `RS ⊥ NS.`); step('Answer', `null space`); }
    else if (t === 'm47_always') { step('Property', `Always true.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm47_rows') { step('Concept', `R³.`); step('Answer', `R³`); }
    else if (t === 'm47_null') { step('Concept', `= 0.`); step('Answer', `0`); }
    else if (t === 'm47_dim_check') { step('Compute', `2+1=3.`); step('Answer', `= ${ans}`); }
    else if (t === 'm47_dim_check2') { step('Compute', `2+1=3.`); step('Answer', `= ${ans}`); }
    else if (t === 'm47_check') { step('Compute', `(${d.n}−${d.r})+${d.r}=${d.n}.`); step('Answer', `= ${ans}`); }
    else if (t === 'm48_fn') { step('Rank-nullity', `= columns.`); step('Answer', `columns`); }
    else if (t === 'm48_b') { step('Compute', `1+1=2.`); step('Answer', `= ${ans}`); }
    else if (t === 'm48_check') { step('Property', `Always.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm48_calc') { step('Compute', `${d.n}−${d.r}=${d.n-d.r}.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm48_rank2') { step('Compute', `4−2=2.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm48_rank0') { step('Compute', `nullity=n.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm48_full') { step('Compute', `= 0.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm48_zero') { step('Compute', `nullity=3.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm49_rank') { step('Compute', `rank=1.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm49_rm') { step('Compute', `R².`); step('Answer', `R²`); }
    else if (t === 'm49_cm') { step('Compute', `R³.`); step('Answer', `R³`); }
    else if (t === 'm49_dim_r') { step('Rank-nullity', `= 2.`); step('Answer', `= ${ans}`); }
    else if (t === 'm49_dim_c') { step('Property', `= 3.`); step('Answer', `= ${ans}`); }
    else if (t === 'm49_subspaces') { step('Compute', `N^T: 3−1=2.`); step('Answer', `${ans}`); }
    else if (t === 'm49_perp1') { step('Compute', `1D⊥1D in R².`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm49_perp2') { step('Compute', `1D⊥2D in R³.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm49_summary') { step('Compute', `2D.`); step('Answer', `${ans}`); }
    else if (t === 'm50_four') { step('Definition', `4.`); step('Answer', `${ans}`); }
    else if (t === 'm50_rank') { step('Definition', `= rank.`); step('Answer', `rank`); }
    else if (t === 'm50_done') { step('Encouragement', `Keep going!`); step('Answer', `${ans}`); }
    else if (t === 'm50_pairs') { step('Property', `R⊥N, C⊥N^T.`); step('Answer', `R⊥N, C⊥N^T`); }
    else if (t === 'm50_ftn') { step('Definition', `Rank-Nullity.`); step('Answer', `Rank-Nullity`); }
    else if (t === 'm50_direct') { step('Definition', `Direct sum.`); step('Answer', `direct`); }
    else if (t === 'm50_rank_nullity') { step('Compute', `3−2=1.`); step('Answer', `nullity = ${ans}`); }
    else if (t === 'm50_dim_check') { step('Compute', `4−3=1.`); step('Answer', `dim = ${ans}`); }
    else if (t === 'm50_all_dims') { step('Compute', `R=${d.r},N=${d.n-d.r},C=${d.r},N^T=${d.n-d.r}.`); step('Answer', `Input: R^${d.n}`); }
    else { step('Answer', `Correct answer: ${ans}`); }
  }
  else if (t.startsWith('m51_') || t.startsWith('m52_') || t.startsWith('m53_') || t.startsWith('m54_') || t.startsWith('m55_') || t.startsWith('m56_')) {
    if (t === 'm51_maxrank') { step('Compute', `min(3,4)=3.`); step('Answer', `${ans}`); }
    else if (t === 'm51_rank') { step('Definition', `Independent patterns.`); step('Answer', `independent`); }
    else if (t === 'm51_lowrank') { step('Concept', `Similar preferences.`); step('Answer', `similar`); }
    else if (t === 'm51_users') { step('Concept', `Redundant preferences.`); step('Answer', `similar preferences`); }
    else if (t === 'm51_factor') { step('Definition', `Matrix factorization.`); step('Answer', `factorization`); }
    else if (t === 'm51_compress') { step('Compute', `Rank 10 << 5000.`); step('Answer', `${ans} (Yes)`); }
    else if (t === 'm52_dot') { step('Definition', `Similarity.`); step('Answer', `similarity`); }
    else if (t === 'm52_zero') { step('Concept', `Not similar.`); step('Answer', `${ans} (No)`); }
    else if (t === 'm52_method') { step('Definition', `Similar users.`); step('Answer', `users`); }
    else if (t === 'm52_calc') { step('Compute', `${d.u[0]*d.v[0]+d.u[1]*d.v[1]}.`); step('Answer', `= ${d.u[0]*d.v[0]+d.u[1]*d.v[1]}`); }
    else if (t === 'm52_cosine') { step('Definition', `Dot/(‖u‖·‖v‖).`); step('Answer', `magnitudes`); }
    else if (t === 'm52_predict') { step('Concept', `Similar users.`); step('Answer', `users`); }
    else if (t === 'm53_links') { step('Concept', `More importance.`); step('Answer', `importance`); }
    else if (t === 'm53_eigen') { step('Definition', `Eigenvector.`); step('Answer', `eigenvector`); }
    else if (t === 'm53_sparse') { step('Concept', `Most entries 0.`); step('Answer', `sparse`); }
    else if (t === 'm53_markov') { step('Concept', `Markov chain.`); step('Answer', `Markov`); }
    else if (t === 'm53_damping') { step('Concept', `Following a link.`); step('Answer', `link`); }
    else if (t === 'm53_steady') { step('Definition', `Steady-state eigenvector.`); step('Answer', `eigenvector`); }
    else if (t === 'm54_converge') { step('Definition', `Dominant eigenvector.`); step('Answer', `dominant`); }
    else if (t === 'm54_iterate') { step('Concept', `Then normalize.`); step('Answer', `normalize`); }
    else if (t === 'm54_eigen1') { step('Property', `= 1.`); step('Answer', `1`); }
    else if (t === 'm51_rank_low') { step('Concept', `Low-rank: fewer parameters than full matrix.`); step('Compute', `r(m+n−r) vs mn.`); step('Answer', `${ans} parameters`); }
    else if (t === 'm52_cos') { step('Concept', `Cosine similarity = u·v / (‖u‖·‖v‖).`); step('Compute', `Dot product over product of magnitudes.`); step('Answer', `= ${ans}`); }
    else if (t === 'm52_dot_calc') { step('Compute', `Multiply corresponding entries and sum.`); step('Answer', `= ${ans}`); }
    else if (t === 'm52_matrix') { step('Concept', `Users × Items matrix dimensions.`); step('Answer', `${ans}`); }
    else if (t === 'm53_two_step') { step('Concept', `Damping factor d: probability of following a link.`); step('Compute', `Random jump = 1−d.`); step('Answer', `= ${ans}`); }
    else if (t === 'm53_eigenvalue') { step('Concept', `Stochastic matrix eigenvalue.`); step('Property', `Largest eigenvalue = 1 for Markov matrix.`); step('Answer', `= ${ans}`); }
    else if (t === 'm54_step') { step('Compute', `Multiply matrix by current vector.`); step('Answer', `= (${ans})`); }
    else if (t === 'm54_speed') { step('Concept', `Gap = λ₁ − λ₂.`); step('Compute', `Larger gap → faster convergence.`); step('Answer', `${ans}`); }
    else if (t === 'm54_norm') { step('Concept', `Normalize to keep vector length = 1.`); step('Compute', `Divide by largest component.`); step('Answer', `= (${ans})`); }
    else if (t === 'm54_det') { step('Compute', `Product of diagonal (for triangular matrix).`); step('Answer', `= ${ans}`); }
    else if (t === 'm54_markov') { step('Property', `Each row of Markov matrix sums to 1.`); step('Answer', `${ans}`); }
    else if (t === 'm54_converge_check') { step('Compute', `|λ₂/λ₁| < 1.`); step('Answer', `${ans}`); }
    else if (t === 'm55_components') { step('Concept', `Principal components = eigenvectors of covariance matrix.`); step('Answer', `${ans}`); }
    else if (t === 'm55_k') { step('Concept', `Choose k components capturing ≥ threshold variance.`); step('Answer', `k = ${ans}`); }
    else if (t === 'm55_explained') { step('Concept', `First PC captures maximum variance.`); step('Answer', `${ans}`); }
    else if (t === 'm55_ratio') { step('Compute', `Eigenvalue / sum of all eigenvalues.`); step('Answer', `= ${ans}`); }
    else if (t === 'm55_eigen_rank') { step('Property', `Rank = number of non-zero eigenvalues.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm56_decomp') { step('Concept', `SVD: A = UΣVᵀ. U columns = column space.`); step('Answer', `${ans}`); }
    else if (t === 'm56_v') { step('Concept', `SVD: V columns = row space.`); step('Answer', `${ans}`); }
    else if (t === 'm56_sigma') { step('Concept', `Σ diagonal = singular values (σ₁ ≥ σ₂ ≥ …).`); step('Answer', `${ans}`); }
    else if (t === 'm56_rank1') { step('Concept', `Rank = number of non-zero singular values.`); step('Answer', `rank = ${ans}`); }
    else if (t === 'm56_identity') { step('Property', `SVD of I: U=V=I, Σ=I.`); step('Answer', `${ans}`); }
    else if (t === 'm56_sigma_count') { step('Compute', `Count non-zero σ values.`); step('Answer', `${ans}`); }
    else { step('Answer', `Correct answer: ${ans}`); }
  }
  else {
    step('Answer', `Correct answer: ${ans}`);
  }
}

/* ── LinearAlgebraApp component ────────────────────── */
function LinearAlgebraApp({ onBack }) {
  const [currentMission, setCurrentMission] = useState(() => {
    try {
      const solved = JSON.parse(localStorage.getItem('la_solved') || '[]');
      const mod2 = JSON.parse(localStorage.getItem('la_module') || '1');
      const mod = MODULES.find(m => m.id === mod2) || MODULES[0];
      const modSolved = solved.filter(id => id >= mod.start && id <= mod.end);
      const next = mod.start + modSolved.length;
      return next <= mod.end ? next : mod.end;
    } catch { return 1; }
  });
  const [currentModule, setCurrentModule] = useState(() => {
    try { return parseInt(localStorage.getItem('la_module') || '1', 10); } catch { return 1; }
  });
  const [phase, setPhase] = useState('modules');
  const [skillLevel, setSkillLevel] = useState('little');
  const [showSteps, setShowSteps] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [solvedMissions, setSolvedMissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('la_solved') || '[]'); } catch { return []; }
  });
  const [selectedRL, setSelectedRL] = useState(null);
  const [showRLSummary, setShowRLSummary] = useState(false);
  const [rlAnswer, setRlAnswer] = useState('');
  const [rlFeedback, setRlFeedback] = useState(null);
  const [shuffledQuiz, setShuffledQuiz] = useState([]);
  const [shuffledMCQ, setShuffledMCQ] = useState(null);
  const [quizDifficulty, setQuizDifficulty] = useState(null);

  const [mqStarted, setMqStarted] = useState(false);
  const [mqFinished, setMqFinished] = useState(false);
  const [mqQuestion, setMqQuestion] = useState(null);
  const [mqAnswer, setMqAnswer] = useState('');
  const [mqScore, setMqScore] = useState(0);
  const [mqQNum, setMqQNum] = useState(0);
  const mqTotal = 10;
  const [mqFeedback, setMqFeedback] = useState('');
  const [mqIsCorrect, setMqIsCorrect] = useState(null);
  const [mqLoading, setMqLoading] = useState(false);
  const [mqLoadError, setMqLoadError] = useState('');
  const [mqRevealed, setMqRevealed] = useState(false);
  const [mqResults, setMqResults] = useState([]);
  const [mqDifficulty, setMqDifficulty] = useState('easy');
  const [mqAdaptiveLevel, setMqAdaptiveLevel] = useState(0);
  const [mqTimer, setMqTimer] = useState(0);
  const mqTimerRef = useRef(null);
  const mqTimerStartRef = useRef(Date.now());
  const ADAPTIVE_LEVELS = ['easy', 'medium', 'hard'];
  const effectiveMqDifficulty = mqDifficulty === 'adaptive' ? ADAPTIVE_LEVELS[Math.min(mqAdaptiveLevel, 2)] : mqDifficulty;
  const mqSubmittedRef = useRef(false);
  const mqAdvancedRef = useRef(false);
  const mqAdvanceRef = useRef(null);
  const mqSubmitRef = useRef(null);
  const mqSeenRef = useRef(new Set());
  const [mqExplanation, setMqExplanation] = useState([]);

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function shuffleQuiz(qs) {
    return shuffle(qs).map(q => {
      if (q.type === 'yesno') return { ...q, options: ['Yes', 'No'] };
      const opts = shuffle(q.options);
      const correctText = q.options[q.correct];
      return { ...q, options: opts, correct: opts.indexOf(correctText) };
    });
  }

  function shuffleMCQOptions(mission) {
    if (mission.answerType !== 'mcq' || !mission.options) return null;
    const opts = shuffle(mission.options);
    const correctText = mission.options[mission.correct];
    return { options: opts, correct: opts.indexOf(correctText) };
  }

  const mission = MISSIONS.find(m => m.id === currentMission) || MISSIONS[0];
  const mod = MODULES.find(m => m.id === currentModule) || MODULES[0];
  const modMissions = MISSIONS.filter(m => m.id >= mod.start && m.id <= mod.end);
  const isFirstMission = currentMission <= mod.start;
  const isLastMission = currentMission >= mod.end;
  const modSolvedCount = solvedMissions.filter(id => id >= mod.start && id <= mod.end).length;
  const modTotal = mod.end - mod.start + 1;
  const moduleComplete = modSolvedCount >= modTotal;

  useEffect(() => {
    try { localStorage.setItem('la_solved', JSON.stringify([...new Set(solvedMissions)])); } catch {}
  }, [solvedMissions]);

  const markSolved = (id) => {
    setSolvedMissions(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const checkAnswer = () => {
    const m = mission;
    const input = answer.trim();
    let correct = false;
    let msg = '';

    if (m.answerType === 'mcq') {
      const correctIdx = shuffledMCQ ? shuffledMCQ.correct : m.correct;
      correct = parseInt(input, 10) === correctIdx;
      msg = correct ? 'Correct!' : 'Not quite. Look at what GeoGebra shows.';
    } else if (m.answerType === 'yesno') {
      const ynIdx = input === 'yes' ? 0 : input === 'no' ? 1 : -1;
      correct = ynIdx === m.correct;
      msg = correct ? 'Correct!' : 'Not quite. Think about what GeoGebra shows.';
    } else if (m.answerType === 'num') {
      const val = parseFloat(input);
      if (isNaN(val)) { setFeedback({ correct: false, message: 'Please enter a number!', detail: '' }); setAttempts(a => a + 1); return; }
      const tol = m.tolerance !== undefined ? m.tolerance : 0.001;
      correct = Math.abs(val - m.correct) <= tol;
      msg = correct ? 'Correct!' : 'Not right. Try again using GeoGebra.';
    } else if (m.answerType === 'text') {
      correct = textMatches(input, m.expectedKeywords || []);
      msg = correct ? 'Correct! Your understanding is right.' : 'Not quite. Try exploring in GeoGebra more.';
    }

    setAttempts(a => a + 1);
    setFeedback({ correct, message: msg, detail: m.explanation || '' });
    if (correct) markSolved(m.id);
  };

  const startPlay = () => {
    const hideAll = skillLevel === 'perfect';
    setPhase('play'); setFeedback(null); setAnswer(''); setAttempts(0);
    setShowHint(false); setShowAnswer(false); setShowSteps(!hideAll);
    setSelectedRL(null); setRlAnswer(''); setRlFeedback(null);
    setQuizAnswers({}); setQuizSubmitted(false); setQuizPassed(false);
    setShuffledMCQ(shuffleMCQOptions(mission));
  };
  const startQuiz = (diff) => {
    setPhase('quiz'); setQuizAnswers({}); setQuizSubmitted(false); setQuizPassed(false);
    setQuizDifficulty(diff);
    let items = mission.quiz || [];
    if (diff === 'easy') items = items.filter(q => q.type === 'yesno' || q.type === 'yn');
    else if (diff === 'medium') items = items.filter(q => q.type !== 'yesno' && q.type !== 'yn' && !q._isHard);
    else if (diff === 'hard') items = items.filter(q => q._isHard || q.type === 'text' || q._isText);
    if (items.length === 0) items = mission.quiz || [];
    let shuffled = shuffleQuiz(items);
    if (diff === 'hard' && mission.answerType === 'num' && mission.correct !== undefined && mission.correct !== null) {
      shuffled.push({ q: 'Extra: ' + mission.prompt, options: [], correct: null, _isNum: true, _answer: mission.correct, _tol: mission.tolerance });
    }
    setShuffledQuiz(shuffled);
  };
  const nextMission = () => {
    if (currentMission < mod.end) { setCurrentMission(c => c + 1); setPhase('intro'); }
    else if (currentModule < MODULES.length) {
      const nextMod = MODULES.find(m => m.id === currentModule + 1);
      if (nextMod) { setCurrentModule(nextMod.id); setCurrentMission(nextMod.start); setPhase('intro');
        try { localStorage.setItem('la_module', String(nextMod.id)); } catch {} }
    }
  };
  const selectQuizOption = (qi, oi) => setQuizAnswers(prev => ({ ...prev, [qi]: oi }));
  const goToMission = (id) => {
    if (id === currentMission || (id > mod.end) || (id < mod.start)) return;
    setCurrentMission(id);
    setPhase('intro');
    setFeedback(null); setAnswer(''); setAttempts(0);
    setShowHint(false); setShowAnswer(false);
    setSelectedRL(null); setRlAnswer(''); setRlFeedback(null);
    setQuizAnswers({}); setQuizSubmitted(false); setQuizPassed(false);
    setShuffledMCQ(null);
    setQuizDifficulty(null);
    setSkillLevel('little');
  };

  const submitQuiz = () => {
    const qs = shuffledQuiz;
    let allCorrect = qs.every((q, i) => quizAnswers[i] === q.correct);
    setQuizSubmitted(true);
    setQuizPassed(allCorrect);
  };

  const handleRLSelect = (idx) => {
    if (selectedRL === idx) { setSelectedRL(null); setRlFeedback(null); setRlAnswer(''); }
    else { setSelectedRL(idx); setRlAnswer(''); setRlFeedback(null); }
  };

  const startMissionQuiz = () => {
    setPhase('missionquiz');
    setMqStarted(false); setMqFinished(false); setMqQuestion(null);
    setMqAnswer(''); setMqScore(0); setMqQNum(0); setMqResults([]);
    setMqFeedback(''); setMqIsCorrect(null); setMqRevealed(false);
    setMqDifficulty('easy'); setMqAdaptiveLevel(0); mqSubmittedRef.current = false; mqAdvancedRef.current = false; mqSeenRef.current = new Set(); setMqExplanation([]);
    setMqTimer(0); mqTimerStartRef.current = Date.now();
  };

  useEffect(() => {
    if (mqStarted && !mqRevealed && !mqFinished && !mqLoading) {
      mqTimerStartRef.current = Date.now();
      mqTimerRef.current = setInterval(() => {
        setMqTimer(Math.floor((Date.now() - mqTimerStartRef.current) / 1000));
      }, 250);
      return () => clearInterval(mqTimerRef.current);
    } else {
      clearInterval(mqTimerRef.current);
    }
  }, [mqStarted, mqRevealed, mqFinished, mqLoading, mqQNum]);

  const loadMqQuestion = async () => {
    setMqLoading(true); setMqLoadError('');
    try {
      const seenParam = mqSeenRef.current.size > 0 ? '&seen=' + encodeURIComponent([...mqSeenRef.current].join(',')) : '';
      const r = await fetch(`${API}/la-mission-quiz-api/question?missionId=${currentMission}&difficulty=${effectiveMqDifficulty}${seenParam}`);
      if (!r.ok) throw new Error(`Server returned ${r.status}`);
      const data = await r.json();
      if (!data || !data.prompt) throw new Error('No prompt');
      if (data.type) mqSeenRef.current.add(data.type);
      setMqQuestion(data); setMqAnswer(''); setMqFeedback(''); setMqIsCorrect(null); setMqRevealed(false); setMqExplanation([]);
      mqSubmittedRef.current = false; mqAdvancedRef.current = false;
    } catch (e) {
      setMqQuestion(null); setMqLoadError(`Couldn't load question (${e.message}).`);
    }
    setMqLoading(false);
  };

  const mqStart = () => {
    setMqStarted(true); setMqFinished(false); setMqScore(0); setMqQNum(1); setMqResults([]);
    mqSubmittedRef.current = false; mqAdvancedRef.current = false;
  };

  const mqAdvance = () => {
    if (mqAdvancedRef.current) return;
    mqAdvancedRef.current = true;
    if (mqQNum >= mqTotal) setMqFinished(true); else setMqQNum(n => n + 1);
  };
  mqAdvanceRef.current = mqAdvance;

  useEffect(() => { if (phase === 'missionquiz' && mqStarted && !mqFinished && mqQNum > 0) loadMqQuestion(); }, [phase, mqStarted, mqQNum, mqFinished]); // eslint-disable-line react-hooks/exhaustive-deps

  const mqSubmit = async (overrideAnswer) => {
    const ans = overrideAnswer || mqAnswer;
    if (!mqQuestion || mqRevealed || !String(ans).trim() || mqSubmittedRef.current) return;
    mqSubmittedRef.current = true;
    const payload = { ...mqQuestion, userAnswer: String(ans).trim() };
    try {
      const r = await fetch(`${API}/la-mission-quiz-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await r.json();
      setMqIsCorrect(data.correct); setMqRevealed(true);
      if (data.correct) setMqScore(s => s + 1);
      if (mqDifficulty === 'adaptive') {
        setMqAdaptiveLevel(prev => data.correct ? Math.min(prev + 1, 2) : Math.max(prev - 1, 0));
      }
      setMqFeedback(data.correct ? `Correct! ${data.display}` : `Incorrect. Answer: ${data.display}`);
      setMqResults(prev => [...prev, { prompt: mqQuestion.prompt, userAnswer: String(ans).trim(), correctAnswer: data.display, correct: data.correct, time: mqTimer }]);
      setMqExplanation(generateMqExplanation(mqQuestion));
    } catch (e) { mqSubmittedRef.current = false; }
  };

  const mqSolve = () => {
    if (!mqQuestion || mqRevealed) return;
    mqSubmittedRef.current = true;
    setMqIsCorrect(false); setMqRevealed(true);
    if (mqDifficulty === 'adaptive') {
      setMqAdaptiveLevel(prev => Math.max(prev - 1, 0));
    }
    const display = mqQuestion.display || mqQuestion.answer || '';
    setMqFeedback(`Solution: ${display}`);
    setMqResults(prev => [...prev, { prompt: mqQuestion.prompt, userAnswer: '(solved)', correctAnswer: display, correct: false }]);
    setMqExplanation(generateMqExplanation(mqQuestion));
  };

  const mqSkip = () => {
    if (!mqQuestion || mqRevealed) return;
    mqSubmittedRef.current = true;
    setMqIsCorrect(false); setMqRevealed(true);
    if (mqDifficulty === 'adaptive') {
      setMqAdaptiveLevel(prev => Math.max(prev - 1, 0));
    }
    setMqFeedback('Skipped.');
    setMqResults(prev => [...prev, { prompt: mqQuestion.prompt, userAnswer: '(skipped)', correctAnswer: '—', correct: false }]);
  };

  const mqKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); if (!mqRevealed) mqSubmit(); else mqAdvance(); } };

  const guidancePanel = () => {
    if (phase !== 'play' || !mission) return null;
    return (
      <div>
        {showSteps && mission.ggbSteps && (
          <div className="la-guidance">
            {mission.ggbSteps.slice(0, -1).map((step, i) => <div key={i} className="la-guidance-step"><span className="step-num">{i + 1}.</span> {step}</div>)}
          </div>
        )}
        {showHint && <div className="la-guidance-hint"><strong>Hint: </strong>{mission.ggbHint}</div>}
        {showAnswer && <div className="la-guidance" style={{ borderLeftColor: 'var(--la-accent)' }}><strong>Explanation: </strong>{mission.solveExplanation}</div>}
      </div>
    );
  };

  const actionButtons = () => (
    <div className="la-action-row">
      <button className="la-action-btn" onClick={() => setShowSteps(!showSteps)}>{showSteps ? 'Hide steps' : 'Show steps'}</button>
      <button className="la-action-btn" onClick={() => { setShowAnswer(!showAnswer); setShowSteps(!showAnswer); }}>{showAnswer ? 'Hide answer' : 'Give up'}</button>
    </div>
  );

  const answerArea = () => {
    if (!mission) return null;
    if (mission.answerType === 'yesno') {
      return (
        <div className="la-answer-area">
          <div className="la-question-prompt">{mission.prompt}</div>
          <div className="la-quiz-options yesno" style={{ justifyContent: 'flex-start', gap: 12, marginBottom: 10 }}>
            <button className={'la-quiz-opt' + (answer === 'yes' ? ' selected' : '')} onClick={() => setAnswer('yes')} style={{ minWidth: 90, fontWeight: 600, fontSize: '0.95rem', padding: '10px 24px' }}>Yes</button>
            <button className={'la-quiz-opt' + (answer === 'no' ? ' selected' : '')} onClick={() => setAnswer('no')} style={{ minWidth: 90, fontWeight: 600, fontSize: '0.95rem', padding: '10px 24px' }}>No</button>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button className="la-check-btn" onClick={checkAnswer} disabled={answer === ''}>Check</button>
          </div>
        </div>
      );
    }
    if (mission.answerType === 'mcq') {
      const mcqData = shuffledMCQ || { options: mission.options, correct: mission.correct };
      return (
        <div className="la-answer-area">
          <div className="la-question-prompt">{mission.prompt}</div>
          <div className="la-mcq-grid">
            {mcqData.options.map((opt, i) => (
              <button key={i} className={'la-mcq-option' + (answer === String(i) ? ' selected' : '')} onClick={() => setAnswer(String(i))}>{opt}</button>
            ))}
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button className="la-check-btn" onClick={checkAnswer} disabled={answer === ''}>Check</button>
          </div>
        </div>
      );
    }
    if (mission.answerType === 'num') {
      return (
        <div className="la-answer-area">
          <div className="la-question-prompt">{mission.prompt}</div>
          <div className="la-input-row">
            <input className="la-num-input" type="text" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Enter number" autoFocus />
            <button className="la-check-btn" onClick={checkAnswer} disabled={!answer.trim()}>Check</button>
          </div>
        </div>
      );
    }
    if (mission.answerType === 'text') {
      return (
        <div className="la-answer-area">
          <div className="la-question-prompt">{mission.prompt}</div>
          <div className="la-input-row">
            <input className="la-text-input" type="text" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer..." autoFocus />
            <button className="la-check-btn" onClick={checkAnswer} disabled={!answer.trim()}>Check</button>
          </div>
        </div>
      );
    }
    return null;
  };

  const feedbackArea = () => {
    if (!feedback) return null;
    return (
      <div className={'la-feedback ' + (feedback.correct ? 'correct' : 'wrong')}>
        <div className="la-feedback-message">{feedback.message}</div>
        {feedback.detail && <div className="la-feedback-detail">{feedback.detail}</div>}
      </div>
    );
  };

  const quizSection = () => {
    const qs = shuffledQuiz;
    const allAnswered = qs.every((_, i) => {
      const ans = quizAnswers[i];
      if (ans === undefined) return false;
      const q = qs[i];
      if (q._isNum) return ans !== '';
      if (q._isText) return ans !== '';
      return true;
    });
    if (!quizDifficulty) {
      return (
        <div className="la-quiz-section">
          <div className="la-quiz-title">Quick Test</div>
          <p style={{ marginBottom: 10, fontWeight: 500 }}>Choose difficulty:</p>
          <div className="la-skill-check">
            <button className={'la-skill-btn' + (quizDifficulty === 'easy' ? ' selected' : '')} onClick={() => startQuiz('easy')}>Easy (Yes/No)</button>
            <button className={'la-skill-btn' + (quizDifficulty === 'medium' ? ' selected' : '')} onClick={() => startQuiz('medium')}>Medium (Short Answer)</button>
            <button className={'la-skill-btn' + (quizDifficulty === 'hard' ? ' selected' : '')} onClick={() => startQuiz('hard')}>Hard (Complex Reasoning)</button>
          </div>
        </div>
      );
    }
    return (
      <div className="la-quiz-section">
        <div className="la-quiz-title">Quick Test <span style={{ fontSize:'0.7rem', opacity:0.6, textTransform:'uppercase' }}>({quizDifficulty})</span></div>
        {qs.map((q, i) => {
          const selected = quizAnswers[i];
          const isCorrect = quizSubmitted && (q._isNum ? selected !== '' && Math.abs(parseFloat(selected) - q._answer) <= (q._tol || 0.001) : q._isText ? textMatches(selected || '', q._keywords || []) : selected === q.correct);
          const isWrong = quizSubmitted && selected !== undefined && !isCorrect;
          if (q._isNum) {
            return (
              <div key={i} className="la-quiz-question">
                <div className="la-quiz-q-text">{q.q}</div>
                <div className="la-input-row">
                  <input className="la-num-input" type="text" value={selected || ''} onChange={e => selectQuizOption(i, e.target.value)} placeholder="Enter number" disabled={quizSubmitted} />
                </div>
                {quizSubmitted && <div className={'la-quiz-result ' + (isCorrect ? 'pass' : 'fail')}>{isCorrect ? 'Correct!' : 'Wrong'}</div>}
              </div>
            );
          }
          if (q._isText) {
            return (
              <div key={i} className="la-quiz-question">
                <div className="la-quiz-q-text">{q.q}</div>
                <div className="la-input-row">
                  <input className="la-text-input" type="text" value={selected || ''} onChange={e => selectQuizOption(i, e.target.value)} placeholder="Type your answer..." disabled={quizSubmitted} />
                </div>
                {quizSubmitted && <div className={'la-quiz-result ' + (isCorrect ? 'pass' : 'fail')}>{isCorrect ? 'Correct!' : 'Wrong'}</div>}
              </div>
            );
          }
          return (
            <div key={i} className="la-quiz-question">
              <div className="la-quiz-q-text">{q.q}</div>
              <div className={'la-quiz-options' + (q.type === 'yesno' ? ' yesno' : '')}>
                {q.type === 'yesno'
                  ? ['Yes', 'No'].map((o, oi) => {
                      let cls = 'la-quiz-opt';
                      if (selected === oi) cls += ' selected';
                      if (isCorrect && oi === q.correct) cls += ' correct';
                      if (isWrong && oi === selected) cls += ' wrong';
                      return <button key={oi} className={cls} onClick={() => !quizSubmitted && selectQuizOption(i, oi)} disabled={quizSubmitted}>{o}</button>;
                    })
                  : q.options.map((o, oi) => {
                      let cls = 'la-quiz-opt';
                      if (selected === oi) cls += ' selected';
                      if (isCorrect && oi === q.correct) cls += ' correct';
                      if (isWrong && oi === selected) cls += ' wrong';
                      return <button key={oi} className={cls} onClick={() => !quizSubmitted && selectQuizOption(i, oi)} disabled={quizSubmitted}>{o}</button>;
                    })
                }
              </div>
              {quizSubmitted && <div className={'la-quiz-result ' + (isCorrect ? 'pass' : 'fail')}>{isCorrect ? 'Correct!' : isWrong ? 'Wrong' : ''}</div>}
            </div>
          );
        })}
        {!quizSubmitted && <button className="la-quiz-next-btn" onClick={submitQuiz} disabled={!allAnswered}>Submit Quiz</button>}
        {quizSubmitted && (
          <div>
            <div className={'la-quiz-result ' + (quizPassed ? 'pass' : 'fail')}>{quizPassed ? 'All correct!' : 'Some wrong. Try again!'}</div>
            {quizPassed && <button className="la-quiz-next-btn" onClick={nextMission}>{isLastMission ? 'Finish Module' : 'Next Mission'}</button>}
            {!quizPassed && <button className="la-quiz-next-btn" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); startQuiz(quizDifficulty); }}>Retry Quiz</button>}
          </div>
        )}
      </div>
    );
  };


  const makeMissionDescriptive = (m) => {
    return (
      <>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--la-accent)', marginBottom: 4 }}>Your Mission: {m.goal}</div>
        <div style={{ fontWeight:400, fontSize:'0.9rem', lineHeight:1.5 }}>{m.story}</div>
      </>
    );
  };

  const makeDescriptiveQuestion = (rl) => {
    const q = (rl.question || '').toLowerCase();
    const hasGraph = !!(rl.equation);
    if (q.includes('y-intercept')||q.includes('intercept value')||q.includes('intercept?')) return hasGraph ? `Looking at the graph above, what is the y-intercept? That is, what is the value of y when x is 0 in this scenario?` : `What is the y-intercept in this scenario? That is, what is the value of y when x is 0?`;
    if (q.includes('slope?')) return `What is the slope of this line? Remember, slope represents the rate of change — how much y increases for each unit increase in x.`;
    if (q.includes('total for')) return hasGraph ? `Using the graph, figure out the total value when x is the given number in this real-world context.` : `Figure out the total value when x is the given number in this real-world context.`;
    if (q.includes('why through origin')) return hasGraph ? `Why does this line pass through the origin (0,0)? Look at the graph — what is special about the y-intercept?` : `Why does this line pass through the origin (0,0)? Think about what the y-intercept means in this context.`;
    if (q.includes('cost for')) return hasGraph ? `Based on the graph, what is the total cost for the given quantity? Find the y-value at the corresponding x-value.` : `What is the total cost for the given quantity? Use the relationship described in the story to calculate it.`;
    if (q.includes('fixed charge')) return `What is the fixed charge or base cost in this scenario? This is the y-intercept — the cost when usage is zero.`;
    if (q.includes('height after')) return hasGraph ? `Using the graph, find the height after the given number of years. What is the y-value at that x-value?` : `Find the height after the given number of years. Use the growth rate described in the story to calculate it.`;
    if (q.includes('type of function')) return hasGraph ? `What type of function is represented by this line? Is it linear, quadratic, or something else? How can you tell from the graph?` : `What type of function is represented here? Is it linear, quadratic, or something else? Think about how the output changes with the input.`;
    if (q.includes('distance for')) return hasGraph ? `Looking at the graph, find the x-value (distance) that gives the total cost shown. Trace from the y-value to the line and down to the x-axis.` : `Find the distance that gives the total cost shown. Use the relationship described in the story to work backwards from cost to distance.`;
    if (q.includes('what does intersection')) return `What does the intersection point of these two lines represent in this real-world scenario? Think about what it means when the two quantities are equal.`;
    if (q.includes('break-even')) return `What is the break-even point? This is where cost equals revenue — the x-value at which the two lines intersect.`;
    if (q.includes('what does collinear')) return `What does it mean for points to be collinear? Think about whether all the points lie on a single straight line.`;
    if (q.includes('through origin?')) return hasGraph ? `Does this line pass through the origin (0,0)? Look at the graph and check whether (0,0) lies on the line.` : `Does this line pass through the origin (0,0)? Think about what the y-intercept tells you.`;
    if (q.includes('what does inverse')) return `What does the inverse of this function tell us? How do we reverse the calculation to find the original input from the output?`;
    if (q.includes('inverse')) return `What is the inverse of this function? How would you reverse the calculation to go from y back to x?`;
    if (q.includes('intersection')) return `Find where the two lines cross. Solve the equations together to get (x,y) — the coordinates of their meeting point.`;
    if (q.includes('why')) return `Explain: ${q}`;
    return `Based on the story above, ${q} Think about the relationships described to figure out the answer.`;
  };

  const realLifeSection = () => {
    const rls = mission.realLife || [];
    const rl = selectedRL !== null ? rls[selectedRL] : null;
    return (
      <div className="la-reallife">
        <div className="la-reallife-title">Real-Life Applications</div>
        <div className="la-reallife-grid">
          {rls.map((rlItem, i) => (
            <button key={i} className={'la-reallife-card' + (selectedRL === i ? ' active' : '')} onClick={() => handleRLSelect(i)}>
              <span className="rl-emoji">{rlItem.emoji}</span>
              <span className="rl-title">{rlItem.title}</span>
            </button>
          ))}
        </div>
        {selectedRL !== null && (
          <div className="la-reallife-expanded">
            {rl.equation && <MiniGraph story={rl.story} equation={rl.equation} />}
            <div className="rl-story">{rl.story}</div>
            <div className="rl-puzzle-box">
              <div className="rl-question">
                <strong>{showRLSummary ? 'Quick question:' : 'What to find:'}</strong>
                {showRLSummary ? rl.question : makeDescriptiveQuestion(rl)}
              </div>
              <button className="rl-summary-toggle" onClick={() => setShowRLSummary(v => !v)}>
                {showRLSummary ? 'Show Full Context' : 'View Summary'}
              </button>
              <div className="rl-input-area">
                <input className="la-text-input" type="text" value={rlAnswer}
                  onChange={e => setRlAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  style={{ flex: 1, minWidth: 150 }}
                    onKeyDown={e => {
                    if (e.key === 'Enter' && rlAnswer.trim()) {
                      const exp = (rl.answer || '').replace(/\s+/g,'').toLowerCase();
                      const got = rlAnswer.replace(/\s+/g,'').toLowerCase();
                      setRlFeedback(got.includes(exp) || got === exp ? '✓ Correct! Well done!' : '✗ Not quite. Try again!');
                    }
                  }} />
                <button className="la-check-btn" onClick={() => {
                  const exp = (rl.answer || '').replace(/\s+/g,'').toLowerCase();
                  const got = rlAnswer.replace(/\s+/g,'').toLowerCase();
                  setRlFeedback(got.includes(exp) || got === exp ? '✓ Correct! Well done!' : '✗ Not quite. Try again!');
                }} disabled={!rlAnswer.trim()}>Check</button>
              </div>
              {rlFeedback && (
                <div className={'rl-feedback ' + (rlFeedback.startsWith('✓') ? 'correct' : 'wrong')}>
                  {rlFeedback}
                </div>
              )}
              {rlFeedback && rlFeedback.startsWith('✓') && (
                <div className="rl-done">Great! You understand how this concept applies in real life!</div>
              )}
              {rlFeedback && rlFeedback.startsWith('✗') && (
                <div className="rl-hint">Hint: Look at the graph above and think about what changes in this scenario!</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (moduleComplete) {
    const allModules = MODULES.every(m => {
      const cnt = solvedMissions.filter(id => id >= m.start && id <= m.end).length;
      return cnt >= (m.end - m.start + 1);
    });
    const isLastMod = currentModule >= MODULES.length;
    if (allModules) {
      return (
        <div className="la-module">
          <button className="la-back" onClick={onBack}>&larr; Home</button>
          <div className="la-complete">
            <h2>All Modules Complete!</h2>
            <div className="big-score">{solvedMissions.length}/36</div>
            <p>You mastered Linear Algebra!</p>
            <button className="la-quiz-next-btn" onClick={onBack} style={{ marginTop: 16, maxWidth: 300, margin: '16px auto 0' }}>Back to Home</button>
          </div>
        </div>
      );
    }
    const pct = Math.round((modSolvedCount / modTotal) * 100);
    return (
      <div className="la-module">
        <button className="la-back" onClick={onBack}>&larr; Home</button>
        <div className="la-complete">
          <h2>{mod.emoji} {mod.title} Complete!</h2>
          <div className="big-score">{modSolvedCount}/{modTotal}</div>
          <p>Score: {pct}%</p>
          {!isLastMod && (
            <button className="la-quiz-next-btn" onClick={() => {
              const nextMod = MODULES.find(m => m.id === currentModule + 1);
              if (nextMod) { setCurrentModule(nextMod.id); setCurrentMission(nextMod.start); setPhase('intro');
                try { localStorage.setItem('la_module', String(nextMod.id)); } catch {} }
            }} style={{ maxWidth: 300, margin: '16px auto 0' }}>
              Next Module &rarr;
            </button>
          )}
          <button className="la-quiz-next-btn" onClick={onBack} style={{ maxWidth: 300, margin: '8px auto 0' }}>Back to Home</button>
        </div>
      </div>
    );
  }

  const openModule = (m) => {
    setCurrentModule(m.id);
    setCurrentMission(m.start);
    setPhase('intro');
    try { localStorage.setItem('la_module', String(m.id)); } catch {}
  };

  const isModuleUnlocked = (m) => {
    if (m.id === 1) return true;
    const prev = MODULES.find(pm => pm.id === m.id - 1);
    if (!prev) return true;
    return solvedMissions.filter(id => id >= prev.start && id <= prev.end).length >= (prev.end - prev.start + 1);
  };

  return (
    <div className="la-module">
      {phase !== 'missionquiz' && <button className="la-back" onClick={onBack}>&larr; Home</button>}

      {phase === 'modules' && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <h2 style={{ margin: '0 0 4px' }}>Linear Algebra</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim)', margin: '0 0 16px' }}>Choose a module to begin. Complete each module to unlock the next.</p>
          <div className="la-flashcard-grid">
            {MODULES.map(m => {
              const unlocked = isModuleUnlocked(m);
              const mSolved = solvedMissions.filter(id => id >= m.start && id <= m.end).length;
              const mTotal = m.end - m.start + 1;
              const isComplete = mSolved >= mTotal;
              const progressPct = mTotal > 0 ? Math.round((mSolved / mTotal) * 100) : 0;
              return (
                <button key={m.id} className={'la-flashcard' + (unlocked ? ' unlocked' : ' locked') + (isComplete ? ' complete' : '')} onClick={() => unlocked && openModule(m)} disabled={!unlocked}>
                  <div className="la-flashcard-emoji">{m.emoji}</div>
                  <div className="la-flashcard-title">Module {m.id}: {m.title}</div>
                  <div className="la-flashcard-sub">{mSolved}/{mTotal} missions{isComplete ? ' — Complete!' : ''}</div>
                  {!unlocked && <div className="la-flashcard-lock">🔒 Complete Module {m.id - 1} to unlock</div>}
                  {unlocked && !isComplete && (
                    <div className="la-flashcard-progress">
                      <div className="la-flashcard-progress-bar" style={{ width: progressPct + '%' }}></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase !== 'modules' && (<>
      <div className="la-header">
        <button className="la-modules-back" onClick={() => setPhase('modules')}>&larr; All Modules</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--la-text)' }}>{mod.emoji} Module {mod.id}: {mod.title}</div>
        </div>
        <h1 style={{ marginTop: 16 }}>{mission.emoji} {mission.title}</h1>
        <p>Mission {currentMission - mod.start + 1} of {modTotal}</p>
      </div>

      <div className="la-progress">
        <button className="la-nav-btn" onClick={() => goToMission(currentMission - 1)} disabled={currentMission <= mod.start}>&larr; Prev</button>
        <div className="la-progress-dots">
          {(() => {
            const currentIdx = currentMission - mod.start;
            const half = 2;
            let startIdx = Math.max(0, currentIdx - half);
            const endIdx = Math.min(modMissions.length - 1, startIdx + 4);
            startIdx = Math.max(0, endIdx - 4);
            const maxUnlocked = Math.max(0, ...solvedMissions.filter(id => id >= mod.start && id <= mod.end)) - mod.start;
            return modMissions.slice(startIdx, endIdx + 1).map((m, i) => {
              const absId = m.id;
              const canClick = solvedMissions.includes(absId) || (absId - mod.start) <= maxUnlocked + 1;
              return (
                <div key={absId} className={'la-progress-dot' + (solvedMissions.includes(absId) ? ' solved' : '') + (absId === currentMission ? ' active' : '') + (!solvedMissions.includes(absId) && absId !== currentMission ? ' locked' : '') + (canClick ? ' clickable' : '')} title={'Mission ' + absId} onClick={canClick ? () => goToMission(absId) : undefined}>
                  {solvedMissions.includes(absId) ? '\u2713' : (absId)}
                </div>
              );
            });
          })()}
        </div>
        <button className="la-nav-btn" onClick={() => goToMission(currentMission + 1)} disabled={currentMission >= mod.end || !solvedMissions.includes(currentMission)}>Next &rarr;</button>
      </div>

      {phase === 'intro' && (
        <div className="la-mission">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--la-accent)', marginBottom: 4 }}>Your Mission:</div>
            <div style={{ fontSize: '1rem', lineHeight: 1.5, color: 'var(--la-text)' }}>{mission.goal}</div>
          </div>
          <button className="la-quiz-next-btn" onClick={startPlay} style={{ maxWidth: 250, margin: '0 auto' }}>Accept Mission</button>
        </div>
      )}

      {phase === 'play' && (
        <div className="la-mission">
          <div className="la-question-prompt" style={{ fontSize:'1.2rem', margin:'0 0 10px', lineHeight:1.6, fontWeight:700 }}>
            {makeMissionDescriptive(mission)}
          </div>
          <GGBEmbed missionId={currentMission} ggbType={mission.ggbType} />
          {actionButtons()}
          {guidancePanel()}
          {answerArea()}
          {feedbackArea()}
          {feedback && feedback.correct && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button className="la-quiz-next-btn" onClick={startMissionQuiz} style={{ maxWidth: 300, margin: '0 auto', background: 'linear-gradient(135deg, #4caf50, #2e7d32)', color: '#fff', border: 'none' }}>Take Quiz (10 questions)</button>
            </div>
          )}
        </div>
      )}

      {phase === 'missionquiz' && (
        <div className="la-mission" style={{ maxWidth: 600, margin: '0 auto' }}>
          <button className="la-back" onClick={() => setPhase('intro')}>&larr; Back to Mission</button>
          <h3 style={{ textAlign: 'center', margin: '12px 0 4px' }}>Mission {currentMission} Quiz</h3>
          {!mqStarted && !mqFinished && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim)', marginBottom: 12 }}>Test your understanding of this mission with 10 questions.</p>
              <div className="checkbox-group" style={{ marginBottom: 12, justifyContent: 'center' }}>
                {['easy', 'medium', 'hard', 'adaptive'].map(d => (
                  <label key={d} className={`checkbox-pill${mqDifficulty === d ? ' active' : ''}`}>
                    <input type="radio" name="mq-diff" checked={mqDifficulty === d} onChange={() => setMqDifficulty(d)} />
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </label>
                ))}
              </div>
              <button className="la-quiz-next-btn" onClick={mqStart} style={{ maxWidth: 250, margin: '0 auto' }}>Start Quiz</button>
            </div>
          )}
          {mqStarted && !mqFinished && (
            <div style={{ textAlign: 'center' }}>
              <div className="progress-pill center" style={{ marginBottom: 8 }}>Question {mqQNum}/{mqTotal} &middot; Score: {mqScore}{mqDifficulty === 'adaptive' ? ` · Level: ${effectiveMqDifficulty}` : ''}</div>
              {mqStarted && !mqFinished && (
                <div style={{ fontSize: '1rem', fontWeight: 600, color: mqTimer > 30 ? 'var(--clr-wrong)' : 'var(--la-accent)', marginBottom: 8 }}>
                  {Math.floor(mqTimer / 60)}:{String(mqTimer % 60).padStart(2, '0')}
                </div>
              )}
              {mqLoading && <div style={{ padding: 20, color: 'var(--clr-text-soft)' }}>Loading…</div>}
              {!mqLoading && mqLoadError && <div style={{ padding: 16, color: 'var(--clr-wrong)' }}>{mqLoadError} <button onClick={loadMqQuestion}>Retry</button></div>}
              {mqQuestion && (
                <div>
                  <div style={{ fontSize: '1.2rem', margin: '16px 0', lineHeight: 1.5 }}>{mqQuestion.prompt}</div>
                  {mqQuestion.choices && mqQuestion.choices.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', margin: '12px 0' }}>
                      {mqQuestion.choices.map((c, ci) => {
                        const selected = mqAnswer === String(c);
                        const showResult = mqRevealed;
                        const isCorrectChoice = String(c).trim() === String(mqQuestion.answer).trim();
                        let bg = 'var(--clr-card)';
                        let border = '1px solid var(--clr-border)';
                        let color = 'var(--clr-text)';
                        if (showResult && isCorrectChoice) { bg = 'rgba(76,175,80,0.2)'; border = '2px solid #4caf50'; color = '#4caf50'; }
                        else if (showResult && selected && !isCorrectChoice) { bg = 'rgba(244,67,54,0.2)'; border = '2px solid #f44336'; color = '#f44336'; }
                        else if (selected) { bg = 'rgba(33,150,243,0.15)'; border = '2px solid var(--clr-accent)'; }
                        return (
                          <button key={ci} disabled={mqRevealed} onClick={() => { if (!mqRevealed) setMqAnswer(String(c)); }}
                            style={{ padding: '10px 20px', borderRadius: 8, background: bg, border, color, cursor: mqRevealed ? 'default' : 'pointer', fontSize: '1rem', fontWeight: 600, minWidth: 80, transition: 'all 0.15s' }}>
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input className="answer-input" type="text" value={mqAnswer} onChange={e => { if (!mqRevealed) setMqAnswer(e.target.value) }} disabled={mqRevealed} placeholder={mqQuestion.answerType === 'vector' ? '(x, y)' : mqQuestion.answerType === 'matrix' ? '[a,b;c,d]' : 'Type answer'} onKeyDown={mqKeyDown} autoFocus style={{ maxWidth: 400 }} />
                  )}
                  {mqFeedback && (
                    <div style={{ margin: '12px 0', padding: '10px 16px', borderRadius: 8, background: mqIsCorrect ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)', color: mqIsCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)', fontWeight: 600 }}>
                      {mqFeedback}
                    </div>
                  )}
                  {mqExplanation.length > 0 && (
                    <div className="mq-explanation-panel">
                      <div className="mq-explanation-title">Step-by-Step Solution</div>
                      {mqExplanation.map((step, i) => (
                        <div key={i} className="mq-explanation-step">
                          <span className="mq-explanation-step-num">{i + 1}.</span>
                          <span className="mq-explanation-step-label">{step.label}</span>
                          <span className="mq-explanation-step-text">{step.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="button-row" style={{ marginTop: 8 }}>
                    {!mqRevealed ? (
                      <>
                        <button onClick={() => mqSubmit()} disabled={mqLoading || !mqAnswer.trim()}>Submit</button>
                        <button onClick={mqSolve} disabled={mqLoading} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>
                        <button onClick={mqSkip} disabled={mqLoading} style={{ background: 'transparent', border: '1px solid var(--clr-text-soft)', color: 'var(--clr-text-soft)' }}>Skip</button>
                      </>
                    ) : (
                      <button onClick={mqAdvance}>{mqQNum >= mqTotal ? 'Finish' : 'Next'}</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {mqFinished && (() => {
            const pct = mqTotal > 0 ? Math.round((mqScore / mqTotal) * 100) : 0;
            const passed = pct >= 80;
            const hasNext = currentMission < mod.end || MODULES.some(m => m.id === currentModule + 1);
            return (
            <div>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <h4>Quiz Complete!</h4>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0' }}>Score: {mqScore}/{mqTotal} ({pct}%)</p>
                {passed && <p style={{ fontSize: '0.95rem', color: 'var(--clr-correct)', fontWeight: 600, margin: '4px 0' }}>Great job! You scored above 80%!</p>}
                {!passed && <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim)', margin: '4px 0' }}>Score at least 80% to unlock real-life applications and the next mission.</p>}
                {mqResults.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0', fontSize: '0.85rem' }}>
                    <thead><tr style={{ borderBottom: '2px solid var(--clr-border)' }}><th style={{ textAlign: 'left', padding: 6 }}>#</th><th style={{ textAlign: 'left', padding: 6 }}>Question</th><th style={{ padding: 6 }}>Time</th><th style={{ padding: 6 }}>Result</th></tr></thead>
                    <tbody>{mqResults.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                        <td style={{ padding: 6 }}>{i + 1}</td>
                        <td style={{ textAlign: 'left', padding: 6, maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.prompt}</td>
                        <td style={{ padding: 6, color: (r.time || 0) > 30 ? 'var(--clr-wrong)' : 'var(--clr-text-soft)' }}>{r.time != null ? `${Math.floor(r.time / 60)}:${String(r.time % 60).padStart(2, '0')}` : '—'}</td>
                        <td style={{ padding: 6, color: r.correct ? 'var(--clr-correct)' : 'var(--clr-wrong)', fontWeight: 600 }}>{r.correct ? '✓' : '✗'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
                <div className="button-row" style={{ marginTop: 12 }}>
                  {passed && hasNext && (
                    <button onClick={() => { nextMission(); setMqStarted(false); setMqFinished(false); }} style={{ background: 'linear-gradient(135deg, #4caf50, #2e7d32)', color: '#fff', border: 'none' }}>Next Mission &rarr;</button>
                  )}
                  {!passed && <button onClick={() => { setMqStarted(false); setMqFinished(false); }}>Try Again</button>}
                  <button onClick={() => setPhase('intro')} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Back to Mission</button>
                </div>
              </div>
              {passed && (
                <div className="la-mission">
                  <div className="la-reallife-title" style={{ textAlign: 'center', marginBottom: 12 }}>Real-Life Applications</div>
                  {realLifeSection()}
                </div>
              )}
            </div>
            );
          })()}
        </div>
      )}
      </>)}
    </div>
  );
}

export default LinearAlgebraApp;

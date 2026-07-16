/**
 * @fileoverview "A World Without Me" — Concept Relevance Content Dictionary
 *
 * Each entry describes what the world would look like if this mathematical
 * concept had never been discovered. Written for students aged 10–16:
 * engaging, imaginative, slightly dramatic — but never scary.
 *
 * Schema per entry:
 *   headline     {string}  Short punchy opening line
 *   body         {string}  1–3 sentences expanding the idea
 *   emoji        {string}  One emoji representing the concept
 *   animationType {string} CSS animation theme: 'collapse' | 'wave' | 'chaos' | 'blind' | 'float' | 'shake' | 'spin'
 *   impactLevel  {string}  'funny' | 'serious' | 'catastrophic'
 *
 * Adding a new topic:
 *   1. Add an entry below keyed by the exact modeMap key (e.g. 'newpuzzle')
 *   2. Fill all 5 fields
 *   3. Commit — no other files need changing
 */

export const WORLD_WITHOUT_ME = {

  // ── Arithmetic ────────────────────────────────────────────────────────────

  addition: {
    headline: 'Without addition, counting stops at 1.',
    body: 'You couldn\'t combine anything. A shop with 3 apples and 4 oranges? That\'s just... 3 apples and 4 oranges. Forever separate. No total, no bill, no change.',
    emoji: '➕',
    animationType: 'chaos',
    impactLevel: 'funny',
  },

  basicarith: {
    headline: 'Without arithmetic, civilization grinds to a halt.',
    body: 'No recipes (how much flour?), no paychecks (how many hours × rate?), no sports scores. Every single trade, purchase, and measurement needs +, −, ×. Take it away and humans are back to bartering with confused looks.',
    emoji: '🔢',
    animationType: 'chaos',
    impactLevel: 'catastrophic',
  },

  multiply: {
    headline: 'Without multiplication, every calculation takes forever.',
    body: 'Adding 7 eight times instead of doing 7×8 doesn\'t sound bad — until you\'re a builder needing 347 bricks for each of 289 rows. Good luck. Also: no computer chips. They run on millions of multiplications per second.',
    emoji: '✖️',
    animationType: 'spin',
    impactLevel: 'serious',
  },

  decimals: {
    headline: 'Without decimals, precision disappears.',
    body: 'Medicine doses would be whole numbers only — imagine if 2.5mg became 2mg or 3mg. That gap matters. Engineering parts couldn\'t be measured accurately. Your phone\'s processor wouldn\'t fit together because tolerances of 0.001mm would be impossible.',
    emoji: '•',
    animationType: 'wave',
    impactLevel: 'catastrophic',
  },

  fractionadd: {
    headline: 'Without fractions, sharing becomes a disaster.',
    body: 'Split a pizza three ways? Impossible to describe mathematically. Music couldn\'t exist — rhythm is all ½ notes, ¼ notes, ⅛ beats. Cooking recipes would become comedy: "use some flour, not a lot, but more than a little."',
    emoji: '½',
    animationType: 'wave',
    impactLevel: 'serious',
  },

  percent: {
    headline: 'Without percentages, nobody knows if they\'re getting a good deal.',
    body: 'Sales ("50% off!") would be meaningless. Banks couldn\'t charge interest or pay savings rates. Disease control would be blind — doctors couldn\'t say "this drug works 94% of the time." The whole economy runs on percentages.',
    emoji: '%',
    animationType: 'chaos',
    impactLevel: 'serious',
  },

  ratio: {
    headline: 'Without ratios, maps become useless paper.',
    body: 'A map drawn at "1:50,000" scale only works because of ratio. Without it, the map could be any random size and no one would know how far anything actually is. Also: mixing paint colours, adjusting recipes for more people, and medicine dosage by body weight all vanish.',
    emoji: '⚖️',
    animationType: 'wave',
    impactLevel: 'serious',
  },

  rounding: {
    headline: 'Without rounding, we\'d be paralysed by infinite digits.',
    body: 'π = 3.14159265... — you need to know when to stop. Engineers, scientists, and computers all need to know how precise to be. Without rounding, simple measurements become unworkable infinite strings of numbers.',
    emoji: '≈',
    animationType: 'float',
    impactLevel: 'funny',
  },

  sqrt: {
    headline: 'Without square roots, you can\'t find distances.',
    body: 'GPS calculates your position using distances in 3D space — all involving square roots. Electrical engineers use them constantly in circuit design. Even your phone\'s screen resolution is defined using √2 ratios.',
    emoji: '√',
    animationType: 'collapse',
    impactLevel: 'catastrophic',
  },

  squaring: {
    headline: 'Without squaring, area becomes a mystery.',
    body: 'The formula for the area of a square is side². Without it, we couldn\'t calculate how much flooring to buy, how large a solar panel needs to be, or how far a signal travels from a phone tower.',
    emoji: '²',
    animationType: 'spin',
    impactLevel: 'serious',
  },

  // ── Number Theory ─────────────────────────────────────────────────────────

  hcflcm: {
    headline: 'Without HCF & LCM, clocks and gears break down.',
    body: 'Two gear wheels with 12 and 18 teeth meet every LCM(12,18)=36 rotations. Gear design in engines, bikes, and watches depends on this. LCD screens use the same idea to sync refresh cycles. Without it, machines would shake themselves apart.',
    emoji: '⚙️',
    animationType: 'shake',
    impactLevel: 'serious',
  },

  primefactor: {
    headline: 'Without prime factorisation, your passwords are worthless.',
    body: 'Every password, bank transaction, and private message online is protected by encryption that relies on prime numbers being hard to factor. Without this knowledge, every bank account, WhatsApp message, and government secret would be wide open.',
    emoji: '🔐',
    animationType: 'blind',
    impactLevel: 'catastrophic',
  },

  bases: {
    headline: 'Without number bases, computers don\'t exist.',
    body: 'Every computer runs on binary (base 2): every photo, video game, message, and song is ultimately just 0s and 1s. Without understanding number bases, we can\'t build or program a single transistor. No computers. No internet. No smartphones.',
    emoji: '💻',
    animationType: 'blind',
    impactLevel: 'catastrophic',
  },

  // ── Algebra ───────────────────────────────────────────────────────────────

  indices: {
    headline: 'Without exponents, science loses its language.',
    body: 'The speed of light is 3×10⁸ m/s. A virus is 10⁻⁷ m wide. Without exponential notation, scientists couldn\'t even write down the numbers they work with, let alone calculate with them. The entire universe is either far too big or far too small to describe.',
    emoji: 'xⁿ',
    animationType: 'float',
    impactLevel: 'catastrophic',
  },

  surds: {
    headline: 'Without surds, exact answers become impossible.',
    body: 'The diagonal of a 1×1 square is exactly √2 — a surd. Engineers need exact values, not messy approximations that accumulate errors. Without surds, precision manufacturing (microchips, aircraft parts) would constantly drift out of tolerance.',
    emoji: '√2',
    animationType: 'wave',
    impactLevel: 'serious',
  },

  lineareq: {
    headline: 'Without linear equations, nothing balances.',
    body: 'Every time a nurse calculates a drip rate, a pilot adjusts fuel load, or a chef scales a recipe, they\'re solving a linear equation. These are the most common equations in everyday decision-making — and without them, we\'d just be guessing.',
    emoji: '📐',
    animationType: 'wave',
    impactLevel: 'serious',
  },

  quadratic: {
    headline: 'Without quadratics, balls follow invisible paths.',
    body: 'Every thrown ball, fired rocket, and arcing basketball follows a quadratic curve — a parabola. Without quadratic equations, engineers can\'t calculate where a projectile will land. That means no ballistics, no satellite launches, no sports science.',
    emoji: '🏀',
    animationType: 'float',
    impactLevel: 'serious',
  },

  qformula: {
    headline: 'Without the quadratic formula, we\'d be stuck guessing roots.',
    body: 'The quadratic formula is one of the most useful tools in all of mathematics. It appears in physics, engineering, economics, and computer graphics. Losing it means losing the ability to solve entire classes of real-world problems precisely.',
    emoji: 'x=',
    animationType: 'chaos',
    impactLevel: 'serious',
  },

  simul: {
    headline: 'Without simultaneous equations, no fair trade exists.',
    body: 'Every time economists balance supply and demand, every time a network engineer routes data through multiple paths, they\'re solving systems of equations. Without this, allocating resources fairly across multiple constraints is basically impossible.',
    emoji: '🔗',
    animationType: 'chaos',
    impactLevel: 'serious',
  },

  funceval: {
    headline: 'Without functions, machines can\'t respond to the world.',
    body: 'A function maps an input to an output. Every sensor, every app, every autonomous vehicle uses functions constantly. Without function evaluation, software can\'t translate "temperature reading" into "turn on the heater." Smart devices go dumb.',
    emoji: 'f(x)',
    animationType: 'blind',
    impactLevel: 'catastrophic',
  },

  lineq: {
    headline: 'Without line equations, GPS doesn\'t know where you are.',
    body: 'A straight-line equation (y = mx + c) describes roads, trajectories, and boundaries. GPS triangulates your position by finding intersections of lines from satellites. Without line equations, navigation technology collapses entirely.',
    emoji: '📍',
    animationType: 'wave',
    impactLevel: 'catastrophic',
  },

  polymul: {
    headline: 'Without polynomial multiplication, signals become noise.',
    body: 'Signal processing — which powers every radio, Wi-Fi chip, and audio system — is built on polynomial operations. Without them, engineers can\'t filter noise from signals. Every wireless call would be incomprehensible static.',
    emoji: '📡',
    animationType: 'shake',
    impactLevel: 'catastrophic',
  },

  polyfactor: {
    headline: 'Without polynomial factoring, equations stay unsolvable.',
    body: 'Factoring is how we crack polynomial equations into manageable pieces. From designing roller-coaster loops to optimising network traffic, factoring unlocks solutions that brute-force methods can\'t find in any reasonable time.',
    emoji: '🧩',
    animationType: 'chaos',
    impactLevel: 'serious',
  },

  sequences: {
    headline: 'Without sequences, interest calculations and growth models vanish.',
    body: 'Geometric sequences power compound interest, population growth models, and viral spread calculations. Arithmetic sequences describe fair payment plans and music rhythms. Without sequences, finance, biology, and acoustics lose their foundations.',
    emoji: '📈',
    animationType: 'float',
    impactLevel: 'serious',
  },

  ineq: {
    headline: 'Without inequalities, constraints don\'t exist.',
    body: 'Every time an engineer says "the bridge must hold at least 50 tonnes" or a doctor says "blood pressure must stay below 140", they\'re using inequalities. Without them, safety limits become just suggestions. Structures get built with no guaranteed margins.',
    emoji: '⚠️',
    animationType: 'shake',
    impactLevel: 'catastrophic',
  },

  binomial: {
    headline: 'Without the Binomial Theorem, probability falls apart.',
    body: 'Predicting the chance of getting exactly 7 heads in 10 coin flips, modelling how diseases spread through populations, computing option prices in finance — all depend on the Binomial Theorem. Without it, statistics loses one of its most powerful tools.',
    emoji: '🎲',
    animationType: 'chaos',
    impactLevel: 'serious',
  },

  remfactor: {
    headline: 'Without the Remainder Theorem, algebra becomes trial and error.',
    body: 'The Remainder and Factor Theorems give us shortcuts to test whether a polynomial has a particular factor without doing long division. They\'re used in error-detection codes for data transmission — the same codes that ensure your downloads aren\'t corrupted.',
    emoji: '📦',
    animationType: 'wave',
    impactLevel: 'serious',
  },

  variation: {
    headline: 'Without variation laws, physics loses cause and effect.',
    body: 'Direct and inverse proportion govern everything from gravity (force ∝ 1/r²) to sound volume. Speakers, lenses, electrical circuits — they\'re all designed using variation. Without it, we can\'t predict how changing one thing affects another.',
    emoji: '🌀',
    animationType: 'spin',
    impactLevel: 'serious',
  },

  stdform: {
    headline: 'Without standard form, we can\'t talk about the universe.',
    body: 'The distance to the nearest star is 4.07×10¹³ km. The mass of a proton is 1.67×10⁻²⁷ kg. Without standard form, scientists would need to write 67 zeros in some measurements. Calculations would take pages just to write down.',
    emoji: '🌌',
    animationType: 'float',
    impactLevel: 'serious',
  },

  bounds: {
    headline: 'Without bounds, measurements become lies.',
    body: 'Every real measurement has uncertainty. If you measure something as 5cm, it might really be 4.97 or 5.03. Engineers use upper and lower bounds to make sure bridges don\'t collapse, aircraft components fit, and medicines are safe within tolerances.',
    emoji: '📏',
    animationType: 'shake',
    impactLevel: 'catastrophic',
  },

  log: {
    headline: 'Without logarithms, earthquakes and sounds have no scale.',
    body: 'The Richter scale for earthquakes and decibels for sound are both logarithmic. Without logs, a 7.0 earthquake and a 7.1 would sound equally serious — but in reality, 7.1 releases TWICE as much energy. Evacuation decisions would be dangerously miscalibrated.',
    emoji: 'log',
    animationType: 'shake',
    impactLevel: 'catastrophic',
  },

  complex: {
    headline: 'Without complex numbers, electronics stops working.',
    body: 'AC electricity (the kind in every wall socket) is described using complex numbers. Every transformer, motor, and power grid is designed with them. Quantum mechanics, which underlies every semiconductor, also requires complex numbers. No complex numbers = no modern electronics.',
    emoji: 'i',
    animationType: 'blind',
    impactLevel: 'catastrophic',
  },

  // ── Geometry ──────────────────────────────────────────────────────────────

  trig: {
    headline: 'Without trigonometry, no one knows where anything is.',
    body: 'GPS satellites use trig to triangulate your position. Architects use it to design roofs. Animators use it to make characters move smoothly. Sound engineers use it to design concert halls. Trigonometry is literally how we measure the world.',
    emoji: '🌐',
    animationType: 'wave',
    impactLevel: 'catastrophic',
  },

  invtrig: {
    headline: 'Without inverse trig, angles stay unknown.',
    body: 'When a robot arm needs to bend to reach a point, it has the coordinates but needs the angle. Inverse trig solves this. Without it, robotic surgery, CNC machining, and computer animation would all lose the ability to calculate precise orientations.',
    emoji: '🤖',
    animationType: 'spin',
    impactLevel: 'serious',
  },

  coordgeom: {
    headline: 'Without coordinate geometry, we can\'t place anything precisely.',
    body: 'Every map, satellite image, video game world, and architectural blueprint uses coordinate geometry. Without it, you couldn\'t specify where something is, only vaguely gesture in a direction. The entire discipline of navigation becomes guesswork.',
    emoji: '🗺️',
    animationType: 'blind',
    impactLevel: 'catastrophic',
  },

  angles: {
    headline: 'Without angle rules, buildings can\'t stand up straight.',
    body: 'Architects and engineers check that every angle in a structure is correct. Parallel lines and transversals govern how roads intersect. Without angle rules, we couldn\'t verify any corner, beam, or joint — structures would fail unpredictably.',
    emoji: '📐',
    animationType: 'collapse',
    impactLevel: 'catastrophic',
  },

  triangles: {
    headline: 'Without triangle properties, the strongest shape crumbles.',
    body: 'Triangles are the most structurally rigid shape — that\'s why trusses, bridges, and towers all use them. Without understanding triangle properties, engineers couldn\'t design frameworks that resist forces. Bridges would twist and collapse under load.',
    emoji: '🔺',
    animationType: 'collapse',
    impactLevel: 'catastrophic',
  },

  congruence: {
    headline: 'Without congruence, mass production becomes impossible.',
    body: 'When a factory makes 10,000 identical bolts, each must be congruent to a template. Without congruence, spare parts wouldn\'t fit. Car engines couldn\'t be repaired with replacement parts. Every machine would need bespoke, one-off components.',
    emoji: '🔩',
    animationType: 'chaos',
    impactLevel: 'catastrophic',
  },

  pythag: {
    headline: 'Without Pythagoras, no corner is truly square.',
    body: 'The "3-4-5 rule" (a Pythagorean triple) is used by builders to check that corners are exactly 90°. Without it, walls lean, doorframes don\'t fit, and bridges can\'t be aligned. Ancient Egyptians used knotted ropes with this rule to build the pyramids.',
    emoji: '🏗️',
    animationType: 'collapse',
    impactLevel: 'catastrophic',
  },

  polygons: {
    headline: 'Without polygon rules, tiling and architecture break down.',
    body: 'Knowing which polygons tile a floor perfectly (triangles, squares, hexagons) comes from understanding interior angles. Honeybees knew this — their hexagonal cells are the most efficient shape. Without polygon geometry, we waste material in every floor, wall, and structure we build.',
    emoji: '⬡',
    animationType: 'float',
    impactLevel: 'serious',
  },

  similarity: {
    headline: 'Without similarity, scale models become lies.',
    body: 'Architects build scale models of buildings. Map-makers shrink entire countries. Film-makers create miniature sets. All of this only works if similar figures maintain exact proportional relationships. Without similarity, a scale model would give completely wrong predictions about the real thing.',
    emoji: '🏛️',
    animationType: 'wave',
    impactLevel: 'serious',
  },

  circleth: {
    headline: 'Without circle theorems, wheels and gears misbehave.',
    body: 'Circle theorems describe how angles, chords, and tangents relate in a circle. Without them, we couldn\'t precisely design gears, pulleys, or wheels. The lens in your camera and the satellites in circular orbit are designed using these exact relationships.',
    emoji: '⭕',
    animationType: 'spin',
    impactLevel: 'serious',
  },

  bearings: {
    headline: 'Without bearings, ships and planes get lost at sea.',
    body: 'Three-figure bearings give every direction a precise number (0°–360°). Before GPS, this was the only way to navigate. Even today, air traffic controllers, ship captains, and military operations rely on bearing calculations. Without them, every journey into open water or sky is a gamble.',
    emoji: '🧭',
    animationType: 'blind',
    impactLevel: 'catastrophic',
  },

  mensur: {
    headline: 'Without mensuration, we can\'t measure anything in 3D.',
    body: 'Volume and surface area calculations govern how we design fuel tanks, medicine capsules, shipping containers, and water pipes. Without mensuration, an engineer designing a fuel tank for a rocket couldn\'t know if it holds enough fuel to reach orbit.',
    emoji: '📦',
    animationType: 'collapse',
    impactLevel: 'catastrophic',
  },

  heron: {
    headline: 'Without Heron\'s formula, irregular land can\'t be measured.',
    body: 'A perfectly rectangular field is easy to measure. But most land — farm fields, building plots, national parks — has irregular triangular shapes. Heron\'s formula lets you find the area from just three side lengths. Without it, land surveyors can\'t calculate property areas or map terrain.',
    emoji: '🌾',
    animationType: 'wave',
    impactLevel: 'serious',
  },

  circmeasure: {
    headline: 'Without radians, wave physics breaks down.',
    body: 'Radians are not just "another way to measure angles" — they\'re the only system where sin(x) ≈ x for small angles, which is what makes calculus work with waves. Without radians, the mathematics of sound, light, and radio waves falls apart.',
    emoji: '〰️',
    animationType: 'wave',
    impactLevel: 'catastrophic',
  },

  conics: {
    headline: 'Without conic sections, we can\'t aim a telescope or orbit a planet.',
    body: 'Every orbit in space is a conic section — circles, ellipses, parabolas, or hyperbolas. Planets orbit in ellipses. Comets fly in hyperbolas. Radio telescope dishes are parabolas. Without conics, space exploration and satellite communication are impossible.',
    emoji: '🚀',
    animationType: 'float',
    impactLevel: 'catastrophic',
  },

  transform: {
    headline: 'Without transformations, animation and graphics don\'t exist.',
    body: 'Every rotation, reflection, and translation in a video game, animated film, or CAD program is a geometric transformation. Without them, 3D graphics is impossible — objects can\'t move, rotate, or be mirrored. Every screen would be a static, unmoving image.',
    emoji: '🎮',
    animationType: 'spin',
    impactLevel: 'catastrophic',
  },

  section: {
    headline: 'Without the section formula, drones can\'t find waypoints.',
    body: 'Dividing a line segment in a given ratio — the section formula — is used in path planning for robots and drones. It\'s also used in computer graphics to interpolate smoothly between positions. Without it, autonomous movement between two points becomes a guessing game.',
    emoji: '🚁',
    animationType: 'float',
    impactLevel: 'serious',
  },

  // ── Calculus ──────────────────────────────────────────────────────────────

  diff: {
    headline: 'Without differentiation, nothing can be optimised.',
    body: 'The cheapest bridge, the fastest route, the most efficient engine, the safest drug dose — all found by differentiation (finding minima and maxima). Without it, engineers would try millions of random designs hoping to get lucky. Machine learning and AI also depend entirely on calculus.',
    emoji: '⚡',
    animationType: 'chaos',
    impactLevel: 'catastrophic',
  },

  integ: {
    headline: 'Without integration, we can\'t calculate areas or total change.',
    body: 'MRI machines calculate body tissue density using integration. Weather simulations integrate equations across millions of grid points. Engineers calculate how much fuel a rocket burns over a flight. Without integration, medicine, meteorology, and aerospace engineering would all collapse.',
    emoji: '🏥',
    animationType: 'wave',
    impactLevel: 'catastrophic',
  },

  limits: {
    headline: 'Without limits, calculus can\'t exist at all.',
    body: 'Limits are the foundation of all calculus — derivatives and integrals only make sense through limits. Without the concept of a limit, we couldn\'t define instantaneous speed, continuous change, or the area under a curve. All of physics and engineering would lose its mathematical backbone.',
    emoji: '∞',
    animationType: 'float',
    impactLevel: 'catastrophic',
  },

  diffeq: {
    headline: 'Without differential equations, we can\'t model any changing system.',
    body: 'How a disease spreads, how a bridge vibrates in wind, how electricity charges a capacitor, how a population grows — all described by differential equations. Without them, epidemiologists couldn\'t predict outbreaks, and structural engineers couldn\'t prevent resonance failures.',
    emoji: '🦠',
    animationType: 'chaos',
    impactLevel: 'catastrophic',
  },

  // ── Statistics & Probability ──────────────────────────────────────────────

  prob: {
    headline: 'Without probability, we\'d make terrible decisions.',
    body: 'Insurance only exists because of probability — companies calculate the likelihood of events to price policies. Medical trials use probability to determine if a drug actually works or just got lucky. Weather forecasts, game design, and financial risk all depend on it.',
    emoji: '🎯',
    animationType: 'chaos',
    impactLevel: 'catastrophic',
  },

  stats: {
    headline: 'Without statistics, data is just noise.',
    body: 'Governments use statistics to plan hospitals, schools, and roads. Scientists use it to determine if results are real or random chance. Without mean, median, and standard deviation, we\'d have mountains of numbers and no way to understand what they say.',
    emoji: '📊',
    animationType: 'wave',
    impactLevel: 'catastrophic',
  },

  permcomb: {
    headline: 'Without permutations & combinations, passwords are trivial to crack.',
    body: 'A 6-digit PIN has 10⁶ = 1,000,000 combinations. Cryptographers use permutation theory to design lock systems that take billions of years to brute-force. Without combinatorics, every security system could be cracked in minutes.',
    emoji: '🔑',
    animationType: 'chaos',
    impactLevel: 'catastrophic',
  },

  // ── Vectors & Matrices ────────────────────────────────────────────────────

  matrix: {
    headline: 'Without matrices, computer graphics and AI don\'t work.',
    body: 'Every rotation, scaling, and perspective transform in a 3D game is a matrix multiplication. Neural networks (the thing behind AI) are fundamentally matrix multiplications chained together. Without matrices, there\'s no 3D graphics and no modern artificial intelligence.',
    emoji: '🎲',
    animationType: 'spin',
    impactLevel: 'catastrophic',
  },

  vectors: {
    headline: 'Without vectors, we can\'t describe anything moving in space.',
    body: 'Velocity, force, electric fields, gravity — all vector quantities with both size AND direction. Without vectors, physics can\'t describe how a ball curves, how planes navigate wind, or how charged particles move in an MRI scanner. Physics loses half its language.',
    emoji: '➡️',
    animationType: 'float',
    impactLevel: 'catastrophic',
  },

  dotprod: {
    headline: 'Without dot products, lights in games go dark.',
    body: 'Lighting in 3D games is calculated using dot products — they tell you how much a surface faces toward a light source. Computer vision (how cameras recognise faces and objects) also depends on them. Without dot products, rendered 3D worlds are flat and lightless.',
    emoji: '💡',
    animationType: 'blind',
    impactLevel: 'serious',
  },

  // ── Applied ───────────────────────────────────────────────────────────────

  sdt: {
    headline: 'Without speed/distance/time, transport is pure guesswork.',
    body: 'Every bus timetable, train schedule, and flight arrival time is calculated with distance ÷ speed. Emergency services use it to estimate response times. Without SDT, you could only say "it\'ll arrive... eventually."',
    emoji: '🚄',
    animationType: 'wave',
    impactLevel: 'serious',
  },

  profitloss: {
    headline: 'Without profit & loss, no business can survive.',
    body: 'Every shop, restaurant, and company needs to know if it\'s making or losing money. Without profit/loss calculations, businesses would have no idea whether to expand, cut costs, or close. The entire economy runs on this fundamental concept.',
    emoji: '💰',
    animationType: 'chaos',
    impactLevel: 'catastrophic',
  },

  shares: {
    headline: 'Without share calculations, investors fly blind.',
    body: 'Trillions of dollars are invested in stock markets every day. Calculating dividend yield, return on investment, and share value relies on this math. Without it, investors couldn\'t evaluate any company, and markets would be pure gambling.',
    emoji: '📈',
    animationType: 'chaos',
    impactLevel: 'serious',
  },

  banking: {
    headline: 'Without banking mathematics, saving money is pointless.',
    body: 'Recurring deposits, compound interest, and loan EMIs are all calculated using banking formulas. Without them, you couldn\'t know how much your savings will grow, or how much your loan will cost you. Banks would have to invent numbers on the spot.',
    emoji: '🏦',
    animationType: 'wave',
    impactLevel: 'serious',
  },

  gst: {
    headline: 'Without GST calculations, taxes become a free-for-all.',
    body: 'Every product in a country with Goods & Services Tax needs precise tax calculations across supply chains. Without the math to track input tax credits and final tax amounts, government revenue collection collapses and prices become arbitrary.',
    emoji: '🧾',
    animationType: 'chaos',
    impactLevel: 'serious',
  },

  linprog: {
    headline: 'Without linear programming, resources get wasted.',
    body: 'Airlines use linear programming to assign crew to flights efficiently. Factories use it to maximise output with limited raw materials. Hospitals use it to schedule staff. Without it, resource allocation is just guesswork, and waste becomes enormous.',
    emoji: '🏭',
    animationType: 'wave',
    impactLevel: 'catastrophic',
  },

  // ── Other / Special ───────────────────────────────────────────────────────

  gk: {
    headline: 'Without general knowledge, you\'re lost in a world you don\'t understand.',
    body: 'Knowing how the world works — history, science, geography — helps you make sense of every news headline, conversation, and decision. Knowledge isn\'t just facts; it\'s the lens through which everything else makes sense.',
    emoji: '🌍',
    animationType: 'float',
    impactLevel: 'serious',
  },

  vocab: {
    headline: 'Without vocabulary, your thoughts stay locked inside you.',
    body: 'Words are the tools of thought itself. The more words you know, the more precisely you can think and communicate. Great scientists, engineers, and leaders are almost always great communicators — and that starts with knowing your words.',
    emoji: '📖',
    animationType: 'wave',
    impactLevel: 'serious',
  },

  sets: {
    headline: 'Without set theory, databases don\'t exist.',
    body: 'Every search query on Google, every filter in a spreadsheet, every database join is a set operation — union, intersection, difference. Without sets, information management collapses. You couldn\'t even search for a contact in your phone.',
    emoji: '⋂',
    animationType: 'chaos',
    impactLevel: 'catastrophic',
  },

  // ── Gym apps (map to closest relevant concept) ────────────────────────────

  gym: {
    headline: 'Without mental math agility, your brain gets slow.',
    body: 'Speed and fluency with numbers isn\'t just about school — it sharpens your brain for every problem-solving situation in life. Athletes train physically every day. Mathematicians train mentally. This is your gym.',
    emoji: '🧠',
    animationType: 'spin',
    impactLevel: 'funny',
  },

  tatsavit: {
    headline: 'Without number fluency, every calculation is a struggle.',
    body: 'Mental math speed is the foundation under all of mathematics. If basic operations feel slow and painful, every harder concept becomes exhausting. Build the foundation fast, and everything else gets easier.',
    emoji: '⚡',
    animationType: 'spin',
    impactLevel: 'serious',
  },

  // ── Meta-modes (shown if user somehow reaches them with a direct select) ──

  randommix: {
    headline: 'Without cross-topic thinking, knowledge stays in silos.',
    body: 'The best problem-solvers mix concepts from different areas. A physicist uses statistics, geometry, and calculus together. Random Mix builds exactly that kind of flexible thinking.',
    emoji: '🎲',
    animationType: 'chaos',
    impactLevel: 'funny',
  },

  custom: {
    headline: 'Your learning, your rules.',
    body: 'Building a custom lesson means you\'re taking control of your own education. That self-directed approach is what separates great students from passive ones.',
    emoji: '🎓',
    animationType: 'float',
    impactLevel: 'funny',
  },
}

/**
 * Safe getter for WWM content.
 * Returns null (not an error) if the topic key has no registered content.
 * This allows the UI to silently skip the card for unknown topics (FR-1 fallback).
 *
 * @param {string} topicKey - The topic key (e.g. 'pythag')
 * @returns {{ headline, body, emoji, animationType, impactLevel } | null}
 */
export function getWorldWithoutMe(topicKey) {
  const entry = WORLD_WITHOUT_ME[topicKey]
  if (!entry) {
    console.warn(`[WorldWithoutMe] No content registered for topic: "${topicKey}". Skipping intro card.`)
    return null
  }
  return entry
}

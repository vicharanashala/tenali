/**
 * Noise Filter Exercise Corpus
 * Contains 80 problems (10 per Tier, Tiers 1-8)
 * Each problem splits the question into tokens with 'isNoise' flags.
 */

export const NOISE_CORPUS = [
  // ================= TIER 1: SIMPLE ADDITION / SUBTRACTION =================
  {
    id: "noise_1_01",
    tier: 1,
    strand: "addition",
    title: "Apples and Bananas",
    question_text: "5 red apples and 3 bananas. How many fruits?",
    tokens: [
      { text: "5", isNoise: false },
      { text: "red", isNoise: true },
      { text: "apples", isNoise: false },
      { text: "and 3", isNoise: false },
      { text: "bananas.", isNoise: false },
      { text: "How many fruits?", isNoise: false }
    ],
    explanation: "Adjective describing the color of the fruits ('red') is irrelevant (noise) to calculating the total count of fruits."
  },
  {
    id: "noise_1_02",
    tier: 1,
    strand: "addition",
    title: "Cupcakes and Cookies",
    question_text: "12 cupcakes and 8 cookies on a table. How many sweets?",
    tokens: [
      { text: "12", isNoise: false },
      { text: "cupcakes", isNoise: false },
      { text: "and 8", isNoise: false },
      { text: "cookies", isNoise: false },
      { text: "on a table.", isNoise: true },
      { text: "How many sweets?", isNoise: false }
    ],
    explanation: "The location ('on a table') is fluff that does not affect the total count of sweets."
  },
  {
    id: "noise_1_03",
    tier: 1,
    strand: "subtraction",
    title: "Toy Cars in a Box",
    question_text: "15 toy cars in a box. 4 are green, rest blue. How many blue?",
    tokens: [
      { text: "15", isNoise: false },
      { text: "toy cars", isNoise: false },
      { text: "in a box.", isNoise: true },
      { text: "4", isNoise: false },
      { text: "are green,", isNoise: false },
      { text: "rest blue.", isNoise: false },
      { text: "How many blue?", isNoise: false }
    ],
    explanation: "The container details ('in a box') are noise since they do not affect the count of the cars."
  },
  {
    id: "noise_1_04",
    tier: 1,
    strand: "addition",
    title: "Roses and Bees",
    question_text: "10 roses and 5 bees. How many flowers?",
    tokens: [
      { text: "10", isNoise: false },
      { text: "roses", isNoise: false },
      { text: "and 5 bees.", isNoise: true },
      { text: "How many flowers?", isNoise: false }
    ],
    explanation: "The insects ('and 5 bees') are noise, as we only need to count the flowers (roses)."
  },
  {
    id: "noise_1_05",
    tier: 1,
    strand: "addition",
    title: "Sam's Shopping List",
    question_text: "blue notebook for $3 and pen for $2. How much spent?",
    tokens: [
      { text: "blue", isNoise: true },
      { text: "notebook for", isNoise: false },
      { text: "$3", isNoise: false },
      { text: "and pen for", isNoise: false },
      { text: "$2.", isNoise: false },
      { text: "How much spent?", isNoise: false }
    ],
    explanation: "The color of the item ('blue') is an irrelevant detail when we just need to add the costs."
  },
  {
    id: "noise_1_06",
    tier: 1,
    strand: "addition",
    title: "Animals in the Barn",
    question_text: "8 pigs and 3 cows in a barn. How many animals?",
    tokens: [
      { text: "8", isNoise: false },
      { text: "pigs", isNoise: false },
      { text: "and 3", isNoise: false },
      { text: "cows", isNoise: false },
      { text: "in a barn.", isNoise: true },
      { text: "How many animals?", isNoise: false }
    ],
    explanation: "The location ('in a barn') does not affect the summation of animal counts."
  },
  {
    id: "noise_1_07",
    tier: 1,
    strand: "subtraction",
    title: "Kids on the Field",
    question_text: "7 kids playing and 4 eating popcorn. How many playing?",
    tokens: [
      { text: "7", isNoise: false },
      { text: "kids playing", isNoise: false },
      { text: "and 4 eating popcorn.", isNoise: true },
      { text: "How many playing?", isNoise: false }
    ],
    explanation: "The other group of kids ('and 4 eating popcorn') is irrelevant to finding the number of kids playing."
  },
  {
    id: "noise_1_08",
    tier: 1,
    strand: "subtraction",
    title: "Lily's Stones",
    question_text: "9 stones found on a beach, but 3 lost. How many now?",
    tokens: [
      { text: "9", isNoise: false },
      { text: "stones found", isNoise: false },
      { text: "on a beach,", isNoise: true },
      { text: "but 3", isNoise: false },
      { text: "lost.", isNoise: false },
      { text: "How many now?", isNoise: false }
    ],
    explanation: "The setting ('on a beach') is a decorative element that does not impact the calculation."
  },
  {
    id: "noise_1_09",
    tier: 1,
    strand: "addition",
    title: "Mice and Milk",
    question_text: "6 mice caught and drank milk. How many mice caught?",
    tokens: [
      { text: "6", isNoise: false },
      { text: "mice caught", isNoise: false },
      { text: "and drank milk.", isNoise: true },
      { text: "How many mice caught?", isNoise: false }
    ],
    explanation: "The cat's milk-drinking habit ('and drank milk') is logical noise relative to the target question."
  },
  {
    id: "noise_1_10",
    tier: 1,
    strand: "addition",
    title: "Sitting on the Bus",
    question_text: "20 seats and 12 children. How many children?",
    tokens: [
      { text: "20 seats and", isNoise: true },
      { text: "12", isNoise: false },
      { text: "children.", isNoise: false },
      { text: "How many children?", isNoise: false }
    ],
    explanation: "The count of bus seats ('20 seats') is irrelevant background information since the goal is simply to find the number of children."
  },

  // ================= TIER 2: MULTIPLICATION / DIVISION =================
  {
    id: "noise_2_01",
    tier: 2,
    strand: "multiplication",
    title: "Toy Boxes and Shelves",
    question_text: "On a rainy Tuesday, a shopkeeper puts 4 boxes of toys on a high shelf. Each box has 6 toys. How many toys are there?",
    tokens: [
      { text: "On a rainy Tuesday,", isNoise: true },
      { text: "a shopkeeper puts", isNoise: true },
      { text: "4", isNoise: false },
      { text: "boxes of toys", isNoise: false },
      { text: "on a high shelf.", isNoise: true },
      { text: "Each box has", isNoise: false },
      { text: "6", isNoise: false },
      { text: "toys.", isNoise: false },
      { text: "How many toys are there?", isNoise: false }
    ],
    explanation: "The day ('On a rainy Tuesday'), the shopkeeper's action, and the shelf description ('on a high shelf') are non-essential details."
  },
  {
    id: "noise_2_02",
    tier: 2,
    strand: "division",
    title: "Sharing Cookies",
    question_text: "Leo wants to share 24 chocolate cookies equally among his 4 best friends at school. How many cookies does each friend get?",
    tokens: [
      { text: "Leo wants to share", isNoise: true },
      { text: "24", isNoise: false },
      { text: "chocolate", isNoise: true },
      { text: "cookies", isNoise: false },
      { text: "equally among his", isNoise: false },
      { text: "4", isNoise: false },
      { text: "best friends", isNoise: true },
      { text: "at school.", isNoise: true },
      { text: "How many cookies does each friend get?", isNoise: false }
    ],
    explanation: "Leo's desire, cookie flavor ('chocolate'), friends rating ('best'), and location ('at school') are fluff. Only the numerical counts are math-relevant."
  },
  {
    id: "noise_2_03",
    tier: 2,
    strand: "multiplication",
    title: "Planting Rows",
    question_text: "A gardener plants 5 rows of sweet carrots, using 8 seeds per row. The weather forecast predicts sunshine. How many carrots are planted?",
    tokens: [
      { text: "A gardener plants", isNoise: false },
      { text: "5", isNoise: false },
      { text: "rows of", isNoise: false },
      { text: "sweet", isNoise: true },
      { text: "carrots,", isNoise: false },
      { text: "using", isNoise: false },
      { text: "8", isNoise: false },
      { text: "seeds per row.", isNoise: false },
      { text: "The weather forecast predicts sunshine.", isNoise: true },
      { text: "How many carrots are planted?", isNoise: false }
    ],
    explanation: "Adjective 'sweet' and the weather forecast sentence are entirely noise."
  },
  {
    id: "noise_2_04",
    tier: 2,
    strand: "division",
    title: "Packs of Soda",
    question_text: "A store has 30 cans of diet soda. They pack them into boxes of 6 cans. The delivery truck is yellow. How many boxes are made?",
    tokens: [
      { text: "A store has", isNoise: false },
      { text: "30", isNoise: false },
      { text: "cans of", isNoise: false },
      { text: "diet", isNoise: true },
      { text: "soda.", isNoise: false },
      { text: "They pack them into boxes of", isNoise: false },
      { text: "6", isNoise: false },
      { text: "cans.", isNoise: false },
      { text: "The delivery truck is yellow.", isNoise: true },
      { text: "How many boxes are made?", isNoise: false }
    ],
    explanation: "'diet' and 'The delivery truck is yellow' do not contribute to calculating the quotient of boxes."
  },
  {
    id: "noise_2_05",
    tier: 2,
    strand: "multiplication",
    title: "Juice Cartons",
    question_text: "A kitchen pantry holds 3 boxes. Each box contains 10 orange juice cartons. Each carton has a plastic straw. How many cartons are there?",
    tokens: [
      { text: "A kitchen pantry holds", isNoise: true },
      { text: "3", isNoise: false },
      { text: "boxes.", isNoise: false },
      { text: "Each box contains", isNoise: false },
      { text: "10", isNoise: false },
      { text: "orange juice", isNoise: true },
      { text: "cartons.", isNoise: false },
      { text: "Each carton has a plastic straw.", isNoise: true },
      { text: "How many cartons are there?", isNoise: false }
    ],
    explanation: "Pantry location, juice flavor ('orange juice'), and straw presence details do not affect multiplication parameters."
  },
  {
    id: "noise_2_06",
    tier: 2,
    strand: "division",
    title: "Ribbon Pieces",
    question_text: "An artist cuts a 40 cm long green ribbon into pieces of 5 cm each. She is making a gift for her mother. How many pieces does she get?",
    tokens: [
      { text: "An artist cuts a", isNoise: true },
      { text: "40 cm", isNoise: false },
      { text: "long", isNoise: false },
      { text: "green", isNoise: true },
      { text: "ribbon into pieces of", isNoise: false },
      { text: "5 cm", isNoise: false },
      { text: "each.", isNoise: false },
      { text: "She is making a gift for her mother.", isNoise: true },
      { text: "How many pieces does she get?", isNoise: false }
    ],
    explanation: "The occupation, ribbon color, and gift purpose are noise. The length parameters (40 cm, 5 cm) are mathematical."
  },
  {
    id: "noise_2_07",
    tier: 2,
    strand: "multiplication",
    title: "Legs of Dogs",
    question_text: "In a park, there are 8 friendly brown dogs running around. Each dog has 4 legs. How many legs are there in total?",
    tokens: [
      { text: "In a park,", isNoise: true },
      { text: "there are", isNoise: false },
      { text: "8", isNoise: false },
      { text: "friendly brown", isNoise: true },
      { text: "dogs running around.", isNoise: false },
      { text: "Each dog has", isNoise: false },
      { text: "4", isNoise: false },
      { text: "legs.", isNoise: false },
      { text: "How many legs are there in total?", isNoise: false }
    ],
    explanation: "Location, friendliness, and color ('friendly brown') are descriptive noise."
  },
  {
    id: "noise_2_08",
    tier: 2,
    strand: "division",
    title: "Books on Shelves",
    question_text: "A heavy library bookshelf has 3 shelves. There are 45 adventure books to be distributed equally. How many books go on each shelf?",
    tokens: [
      { text: "A", isNoise: false },
      { text: "heavy", isNoise: true },
      { text: "library bookshelf has", isNoise: false },
      { text: "3", isNoise: false },
      { text: "shelves.", isNoise: false },
      { text: "There are", isNoise: false },
      { text: "45", isNoise: false },
      { text: "adventure", isNoise: true },
      { text: "books to be distributed equally.", isNoise: false },
      { text: "How many books go on each shelf?", isNoise: false }
    ],
    explanation: "Weight of the bookshelf ('heavy') and the genre ('adventure') are irrelevant fluff."
  },
  {
    id: "noise_2_09",
    tier: 2,
    strand: "multiplication",
    title: "Eraser Packs",
    question_text: "A teacher buys 7 packs of rubber erasers. Each pack has 5 erasers. She got them on discount. How many erasers does she buy?",
    tokens: [
      { text: "A teacher buys", isNoise: false },
      { text: "7", isNoise: false },
      { text: "packs of", isNoise: false },
      { text: "rubber", isNoise: true },
      { text: "erasers.", isNoise: false },
      { text: "Each pack has", isNoise: false },
      { text: "5", isNoise: false },
      { text: "erasers.", isNoise: false },
      { text: "She got them on discount.", isNoise: true },
      { text: "How many erasers does she buy?", isNoise: false }
    ],
    explanation: "Material ('rubber') and discount info ('She got them on discount') are not used to calculate quantity."
  },
  {
    id: "noise_2_10",
    tier: 2,
    strand: "division",
    title: "Dividing Eggs",
    question_text: "A chef has 36 large chicken eggs. He wants to put them in cartons of 6. He is baking a cake. How many cartons does he need?",
    tokens: [
      { text: "A chef has", isNoise: true },
      { text: "36", isNoise: false },
      { text: "large chicken", isNoise: true },
      { text: "eggs.", isNoise: false },
      { text: "He wants to put them in cartons of", isNoise: false },
      { text: "6.", isNoise: false },
      { text: "He is baking a cake.", isNoise: true },
      { text: "How many cartons does he need?", isNoise: false }
    ],
    explanation: "The occupation, size/type ('large chicken'), and context ('He is baking a cake') are irrelevant to the division calculation."
  },

  // ================= TIER 3: FRACTIONS & DECIMALS =================
  {
    id: "noise_3_01",
    tier: 3,
    strand: "fractions",
    title: "Pizza Slices",
    question_text: "A round pepperoni pizza is cut into 8 equal slices. Maya eats 3 slices. Her brother eats 2 slices of apple. What fraction of the pizza is eaten?",
    tokens: [
      { text: "A", isNoise: false },
      { text: "round pepperoni", isNoise: true },
      { text: "pizza is cut into", isNoise: false },
      { text: "8", isNoise: false },
      { text: "equal slices.", isNoise: false },
      { text: "Maya eats", isNoise: false },
      { text: "3", isNoise: false },
      { text: "slices.", isNoise: false },
      { text: "Her brother eats 2 slices of apple.", isNoise: true },
      { text: "What fraction of the pizza is eaten?", isNoise: false }
    ],
    explanation: "The toppings/shape of the pizza and the brother eating apple slices are logical noise since the question specifies 'fraction of the pizza'."
  },
  {
    id: "noise_3_02",
    tier: 3,
    strand: "decimals",
    title: "Milk in a Jug",
    question_text: "A plastic jug contains 1.5 liters of organic milk. Clara pours 0.4 liters into a glass. Clara is 10 years old. How much milk is left in the jug?",
    tokens: [
      { text: "A", isNoise: false },
      { text: "plastic", isNoise: true },
      { text: "jug contains", isNoise: false },
      { text: "1.5 liters", isNoise: false },
      { text: "of", isNoise: false },
      { text: "organic", isNoise: true },
      { text: "milk.", isNoise: false },
      { text: "Clara pours", isNoise: false },
      { text: "0.4 liters", isNoise: false },
      { text: "into a glass.", isNoise: true },
      { text: "Clara is 10 years old.", isNoise: true },
      { text: "How much milk is left in the jug?", isNoise: false }
    ],
    explanation: "Container type ('plastic'), milk quality ('organic'), destination ('into a glass'), and Clara's age are noise."
  },
  {
    id: "noise_3_03",
    tier: 3,
    strand: "fractions",
    title: "Class Students",
    question_text: "In a class of 24 children, 2/3 of them play musical instruments. 5 kids like orange juice. How many kids play instruments?",
    tokens: [
      { text: "In a class of", isNoise: false },
      { text: "24", isNoise: false },
      { text: "children,", isNoise: false },
      { text: "2/3", isNoise: false },
      { text: "of them play musical instruments.", isNoise: false },
      { text: "5 kids like orange juice.", isNoise: true },
      { text: "How many kids play instruments?", isNoise: false }
    ],
    explanation: "The statement '5 kids like orange juice' is noise since it has no mathematical link to the query about musical instruments."
  },
  {
    id: "noise_3_04",
    tier: 3,
    strand: "decimals",
    title: "Ribbon Lengths",
    question_text: "A red ribbon is 2.8 meters long, and a blue ribbon is 1.4 meters long. The red ribbon was bought at Walmart. What is their combined length?",
    tokens: [
      { text: "A", isNoise: false },
      { text: "red", isNoise: true },
      { text: "ribbon is", isNoise: false },
      { text: "2.8 meters", isNoise: false },
      { text: "long, and a", isNoise: false },
      { text: "blue", isNoise: true },
      { text: "ribbon is", isNoise: false },
      { text: "1.4 meters", isNoise: false },
      { text: "long.", isNoise: false },
      { text: "The red ribbon was bought at Walmart.", isNoise: true },
      { text: "What is their combined length?", isNoise: false }
    ],
    explanation: "The ribbon colors ('red', 'blue') and purchasing location ('bought at Walmart') are irrelevant fluff."
  },
  {
    id: "noise_3_05",
    tier: 3,
    strand: "fractions",
    title: "Cookie Recipe",
    question_text: "A recipe requires 3/4 cup of white sugar. Chef James also adds a pinch of salt. He makes 2 batches. How much sugar does he need?",
    tokens: [
      { text: "A recipe requires", isNoise: false },
      { text: "3/4 cup", isNoise: false },
      { text: "of", isNoise: false },
      { text: "white", isNoise: true },
      { text: "sugar.", isNoise: false },
      { text: "Chef James also adds a pinch of salt.", isNoise: true },
      { text: "He makes", isNoise: false },
      { text: "2", isNoise: false },
      { text: "batches.", isNoise: false },
      { text: "How much sugar does he need?", isNoise: false }
    ],
    explanation: "Color 'white' and salt addition ('Chef James also adds a pinch of salt') are irrelevant to the sugar quantity calculation."
  },
  {
    id: "noise_3_06",
    tier: 3,
    strand: "decimals",
    title: "Store Items",
    question_text: "A toy dinosaur costs $5.50. A toy car costs $3.25. The sales tax rate is 0%. The shop has a green neon sign. What is the total cost of both?",
    tokens: [
      { text: "A toy dinosaur costs", isNoise: false },
      { text: "$5.50.", isNoise: false },
      { text: "A toy car costs", isNoise: false },
      { text: "$3.25.", isNoise: false },
      { text: "The sales tax rate is 0%.", isNoise: true },
      { text: "The shop has a green neon sign.", isNoise: true },
      { text: "What is the total cost of both?", isNoise: false }
    ],
    explanation: "The sales tax rate of 0% (since it has no effect) and the shop's decoration ('green neon sign') are noise."
  },
  {
    id: "noise_3_07",
    tier: 3,
    strand: "fractions",
    title: "Books Read",
    question_text: "Kevin read 1/5 of a 200-page mystery book. The book has a red leather cover. How many pages did Kevin read?",
    tokens: [
      { text: "Kevin read", isNoise: false },
      { text: "1/5", isNoise: false },
      { text: "of a", isNoise: false },
      { text: "200-page", isNoise: false },
      { text: "mystery", isNoise: true },
      { text: "book.", isNoise: false },
      { text: "The book has a red leather cover.", isNoise: true },
      { text: "How many pages did Kevin read?", isNoise: false }
    ],
    explanation: "Book genre ('mystery') and cover details ('red leather cover') are noise."
  },
  {
    id: "noise_3_08",
    tier: 3,
    strand: "decimals",
    title: "Run Times",
    question_text: "A runner completes a lap in 45.2 seconds on a concrete track. Another completes it in 48.5 seconds. What is the time difference?",
    tokens: [
      { text: "A runner completes a lap in", isNoise: false },
      { text: "45.2 seconds", isNoise: false },
      { text: "on a concrete track.", isNoise: true },
      { text: "Another completes it in", isNoise: false },
      { text: "48.5 seconds.", isNoise: false },
      { text: "What is the time difference?", isNoise: false }
    ],
    explanation: "The composition of the track ('on a concrete track') is noise."
  },
  {
    id: "noise_3_09",
    tier: 3,
    strand: "fractions",
    title: "Fruit Weights",
    question_text: "A basket holds 1/2 kg of apples and 1/4 kg of grapes. The basket itself weighs 0.1 kg. What is the total weight of the fruits?",
    tokens: [
      { text: "A basket holds", isNoise: true },
      { text: "1/2 kg", isNoise: false },
      { text: "of apples and", isNoise: false },
      { text: "1/4 kg", isNoise: false },
      { text: "of grapes.", isNoise: false },
      { text: "The basket itself weighs 0.1 kg.", isNoise: true },
      { text: "What is the total weight of the fruits?", isNoise: false }
    ],
    explanation: "The weight of the basket container ('0.1 kg') is noise because the question explicitly asks for the total weight of the *fruits*."
  },
  {
    id: "noise_3_10",
    tier: 3,
    strand: "decimals",
    title: "Soda Cans",
    question_text: "A soda can has 0.355 liters of liquid. Jack drinks 0.12 liters of it. Jack is wearing a blue shirt. How much liquid remains in the can?",
    tokens: [
      { text: "A soda can has", isNoise: false },
      { text: "0.355 liters", isNoise: false },
      { text: "of liquid.", isNoise: false },
      { text: "Jack drinks", isNoise: false },
      { text: "0.12 liters", isNoise: false },
      { text: "of it.", isNoise: false },
      { text: "Jack is wearing a blue shirt.", isNoise: true },
      { text: "How much liquid remains in the can?", isNoise: false }
    ],
    explanation: "Jack's shirt color ('wearing a blue shirt') is irrelevant to the math calculation."
  },

  // ================= TIER 4: MEASUREMENT & TIME =================
  {
    id: "noise_4_01",
    tier: 4,
    strand: "speed",
    title: "Train Journey",
    question_text: "A train travels at 80 km/h for 3 hours. The driver's name is John, and the train has 5 passenger coaches. How far does it travel?",
    tokens: [
      { text: "A train travels at", isNoise: false },
      { text: "80 km/h", isNoise: false },
      { text: "for", isNoise: false },
      { text: "3 hours.", isNoise: false },
      { text: "The driver's name is John,", isNoise: true },
      { text: "and the train has 5 passenger coaches.", isNoise: true },
      { text: "How far does it travel?", isNoise: false }
    ],
    explanation: "The driver's name ('John') and train passenger cars ('5 passenger coaches') are noise details that do not affect distance (speed × time)."
  },
  {
    id: "noise_4_02",
    tier: 4,
    strand: "time",
    title: "Studying Time",
    question_text: "Lara studies math for 45 minutes on her laptop and science for 30 minutes. She takes a break to drink tea. How long does she study?",
    tokens: [
      { text: "Lara studies math for", isNoise: false },
      { text: "45 minutes", isNoise: false },
      { text: "on her laptop", isNoise: true },
      { text: "and science for", isNoise: false },
      { text: "30 minutes.", isNoise: false },
      { text: "She takes a break to drink tea.", isNoise: true },
      { text: "How long does she study?", isNoise: false }
    ],
    explanation: "The study device ('on her laptop') and the break description ('drink tea') are irrelevant to the study duration sum."
  },
  {
    id: "noise_4_03",
    tier: 4,
    strand: "weight",
    title: "Luggage Bags",
    question_text: "A suitcase weighs 18 kg. A smaller backpack weighs 5 kg. The suitcase has wheels. What is their total weight?",
    tokens: [
      { text: "A suitcase weighs", isNoise: false },
      { text: "18 kg.", isNoise: false },
      { text: "A smaller backpack weighs", isNoise: false },
      { text: "5 kg.", isNoise: false },
      { text: "The suitcase has wheels.", isNoise: true },
      { text: "What is their total weight?", isNoise: false }
    ],
    explanation: "The physical design details ('suitcases has wheels') are noise."
  },
  {
    id: "noise_4_04",
    tier: 4,
    strand: "length",
    title: "Board Length",
    question_text: "A wooden plank is 2.5 meters long. A builder cuts off 0.7 meters with a hand saw. The plank is pine wood. How long is the plank now?",
    tokens: [
      { text: "A", isNoise: false },
      { text: "wooden", isNoise: true },
      { text: "plank is", isNoise: false },
      { text: "2.5 meters", isNoise: false },
      { text: "long. A builder cuts off", isNoise: false },
      { text: "0.7 meters", isNoise: false },
      { text: "with a hand saw.", isNoise: true },
      { text: "The plank is pine wood.", isNoise: true },
      { text: "How long is the plank now?", isNoise: false }
    ],
    explanation: "Material type ('wooden', 'pine wood') and the tool ('with a hand saw') do not affect subtraction metrics."
  },
  {
    id: "noise_4_05",
    tier: 4,
    strand: "speed",
    title: "Running Race",
    question_text: "A runner runs at 6 m/s. A strong wind blows in the opposite direction. He runs for 20 seconds. How far does he run?",
    tokens: [
      { text: "A runner runs at", isNoise: false },
      { text: "6 m/s.", isNoise: false },
      { text: "A strong wind blows in the opposite direction.", isNoise: true },
      { text: "He runs for", isNoise: false },
      { text: "20 seconds.", isNoise: false },
      { text: "How far does he run?", isNoise: false }
    ],
    explanation: "Wind speed or direction is noise here since the runner's speed is already given as constant relative to the ground."
  },
  {
    id: "noise_4_06",
    tier: 4,
    strand: "time",
    title: "Flight Duration",
    question_text: "A plane flight departs at 2:00 PM and arrives at 5:30 PM. The plane serves chicken meals. What is the duration of the flight?",
    tokens: [
      { text: "A plane flight departs at", isNoise: false },
      { text: "2:00 PM", isNoise: false },
      { text: "and arrives at", isNoise: false },
      { text: "5:30 PM.", isNoise: false },
      { text: "The plane serves chicken meals.", isNoise: true },
      { text: "What is the duration of the flight?", isNoise: false }
    ],
    explanation: "Meal service ('plane serves chicken meals') is irrelevant fluff."
  },
  {
    id: "noise_4_07",
    tier: 4,
    strand: "weight",
    title: "Cement Bags",
    question_text: "A bag of cement weighs 50 kg. A builder loads 10 bags onto a red truck. The truck has 4 wheels. What is the total weight of the cement?",
    tokens: [
      { text: "A bag of cement weighs", isNoise: false },
      { text: "50 kg.", isNoise: false },
      { text: "A builder loads", isNoise: true },
      { text: "10", isNoise: false },
      { text: "bags", isNoise: false },
      { text: "onto a red truck.", isNoise: true },
      { text: "The truck has 4 wheels.", isNoise: true },
      { text: "What is the total weight of the cement?", isNoise: false }
    ],
    explanation: "Loading process, truck description, and count of truck wheels are noise since we only calculate cement mass."
  },
  {
    id: "noise_4_08",
    tier: 4,
    strand: "length",
    title: "Ruler Measurements",
    question_text: "A steel ruler is 30 cm long. A plastic ruler is 15 cm long. Steel is stronger than plastic. What is the sum of their lengths?",
    tokens: [
      { text: "A", isNoise: false },
      { text: "steel", isNoise: true },
      { text: "ruler is", isNoise: false },
      { text: "30 cm", isNoise: false },
      { text: "long. A", isNoise: false },
      { text: "plastic", isNoise: true },
      { text: "ruler is", isNoise: false },
      { text: "15 cm", isNoise: false },
      { text: "long.", isNoise: false },
      { text: "Steel is stronger than plastic.", isNoise: true },
      { text: "What is the sum of their lengths?", isNoise: false }
    ],
    explanation: "Ruler materials and comparison sentence ('Steel is stronger...') are noise."
  },
  {
    id: "noise_4_09",
    tier: 4,
    strand: "speed",
    title: "Cycling Journey",
    question_text: "Ben cycles at 15 km/h for 2 hours. He wears a red helmet. The temperature is 22 degrees. How far does Ben cycle?",
    tokens: [
      { text: "Ben cycles at", isNoise: false },
      { text: "15 km/h", isNoise: false },
      { text: "for", isNoise: false },
      { text: "2 hours.", isNoise: false },
      { text: "He wears a red helmet.", isNoise: true },
      { text: "The temperature is 22 degrees.", isNoise: true },
      { text: "How far does Ben cycle?", isNoise: false }
    ],
    explanation: "Helmet details and local weather temperature are logical noise."
  },
  {
    id: "noise_4_10",
    tier: 4,
    strand: "time",
    title: "Boiling Eggs",
    question_text: "Cooking an egg takes 6 minutes in boiling water. It takes 2 minutes to peel it. What is the total time spent cooking and peeling?",
    tokens: [
      { text: "Cooking an egg takes", isNoise: false },
      { text: "6 minutes", isNoise: false },
      { text: "in boiling water.", isNoise: true },
      { text: "It takes", isNoise: false },
      { text: "2 minutes", isNoise: false },
      { text: "to peel it.", isNoise: false },
      { text: "What is the total time spent cooking and peeling?", isNoise: false }
    ],
    explanation: "The condition of the water ('in boiling water') is fluff. Only the timer durations (6 mins, 2 mins) are math-relevant."
  },

  // ================= TIER 5: INTRODUCTORY GEOMETRY =================
  {
    id: "noise_5_01",
    tier: 5,
    strand: "perimeter",
    title: "Rectangular Garden",
    question_text: "A rectangular garden has a length of 12 meters and a width of 8 meters. It is surrounded by a white picket fence. Find its perimeter.",
    tokens: [
      { text: "A rectangular garden has a length of", isNoise: false },
      { text: "12 meters", isNoise: false },
      { text: "and a width of", isNoise: false },
      { text: "8 meters.", isNoise: false },
      { text: "It is surrounded by a white picket fence.", isNoise: true },
      { text: "Find its perimeter.", isNoise: false }
    ],
    explanation: "The fence material description ('white picket fence') is irrelevant to calculating the perimeter (2 × (l + w))."
  },
  {
    id: "noise_5_02",
    tier: 5,
    strand: "area",
    title: "Triangular Flag",
    question_text: "A triangular flag has a base of 10 cm and a height of 6 cm. It is colored bright green. What is the area of the flag?",
    tokens: [
      { text: "A triangular flag has a base of", isNoise: false },
      { text: "10 cm", isNoise: false },
      { text: "and a height of", isNoise: false },
      { text: "6 cm.", isNoise: false },
      { text: "It is colored bright green.", isNoise: true },
      { text: "What is the area of the flag?", isNoise: false }
    ],
    explanation: "The color of the flag ('bright green') is noise because area calculations only depend on dimensions (base, height)."
  },
  {
    id: "noise_5_03",
    tier: 5,
    strand: "angles",
    title: "Right Angle Split",
    question_text: "A right angle is split into two angles. One angle is 35 degrees. The angle is drawn with a black marker. What is the other angle?",
    tokens: [
      { text: "A right angle is split into two angles. One angle is", isNoise: false },
      { text: "35 degrees.", isNoise: false },
      { text: "The angle is drawn with a black marker.", isNoise: true },
      { text: "What is the other angle?", isNoise: false }
    ],
    explanation: "The drawing instrument description ('drawn with a black marker') is noise."
  },
  {
    id: "noise_5_04",
    tier: 5,
    strand: "volume",
    title: "Cubic Box",
    question_text: "A box shaped like a cube has sides of length 4 cm. The box is made of cardboard. What is the volume of the box?",
    tokens: [
      { text: "A box shaped like a cube has sides of length", isNoise: false },
      { text: "4 cm.", isNoise: false },
      { text: "The box is made of cardboard.", isNoise: true },
      { text: "What is the volume of the box?", isNoise: false }
    ],
    explanation: "The material ('made of cardboard') is noise since the volume of a cube depends purely on side length."
  },
  {
    id: "noise_5_05",
    tier: 5,
    strand: "perimeter",
    title: "Square Tile",
    question_text: "A square tile has side lengths of 5 inches. The tile is used in a bathroom. Calculate its perimeter.",
    tokens: [
      { text: "A square tile has side lengths of", isNoise: false },
      { text: "5 inches.", isNoise: false },
      { text: "The tile is used in a bathroom.", isNoise: true },
      { text: "Calculate its perimeter.", isNoise: false }
    ],
    explanation: "The room setting ('used in a bathroom') is irrelevant to perimeter calculations."
  },
  {
    id: "noise_5_06",
    tier: 5,
    strand: "area",
    title: "Circular Coin",
    question_text: "A silver coin has a radius of 2 cm. It was minted in 1995. Find its area (using pi = 3.14).",
    tokens: [
      { text: "A", isNoise: false },
      { text: "silver", isNoise: true },
      { text: "coin has a radius of", isNoise: false },
      { text: "2 cm.", isNoise: false },
      { text: "It was minted in 1995.", isNoise: true },
      { text: "Find its area (using pi = 3.14).", isNoise: false }
    ],
    explanation: "The coin metal ('silver') and the mint year ('minted in 1995') are irrelevant to area calculation (pi × r²)."
  },
  {
    id: "noise_5_07",
    tier: 5,
    strand: "angles",
    title: "Triangle Angles",
    question_text: "A triangle has angles of 50 degrees and 60 degrees. The triangle is isosceles. Find the third angle of the triangle.",
    tokens: [
      { text: "A triangle has angles of", isNoise: false },
      { text: "50 degrees", isNoise: false },
      { text: "and", isNoise: false },
      { text: "60 degrees.", isNoise: false },
      { text: "The triangle is isosceles.", isNoise: true },
      { text: "Find the third angle of the triangle.", isNoise: false }
    ],
    explanation: "The description 'The triangle is isosceles' is mathematically inconsistent with the given angles (50, 60, 70), and in any case, it is noise since any triangle's angles sum to 180."
  },
  {
    id: "noise_5_08",
    tier: 5,
    strand: "volume",
    title: "Aquarium Tank",
    question_text: "An aquarium tank is 10 dm long, 5 dm wide, and 4 dm high. It contains 3 goldfish. Calculate the volume of the tank.",
    tokens: [
      { text: "An aquarium tank is", isNoise: false },
      { text: "10 dm", isNoise: false },
      { text: "long,", isNoise: false },
      { text: "5 dm", isNoise: false },
      { text: "wide, and", isNoise: false },
      { text: "4 dm", isNoise: false },
      { text: "high.", isNoise: false },
      { text: "It contains 3 goldfish.", isNoise: true },
      { text: "Calculate the volume of the tank.", isNoise: false }
    ],
    explanation: "The contents of the tank ('contains 3 goldfish') are noise relative to calculating the volume of the container."
  },
  {
    id: "noise_5_09",
    tier: 5,
    strand: "perimeter",
    title: "Triangular Park",
    question_text: "A triangular park has sides of 30m, 40m, and 50m. The park has grass. Find the perimeter of the park.",
    tokens: [
      { text: "A triangular park has sides of", isNoise: false },
      { text: "30m,", isNoise: false },
      { text: "40m,", isNoise: false },
      { text: "and", isNoise: false },
      { text: "50m.", isNoise: false },
      { text: "The park has grass.", isNoise: true },
      { text: "Find the perimeter of the park.", isNoise: false }
    ],
    explanation: "The fact that the park has grass is noise. We only need the side lengths to calculate perimeter."
  },
  {
    id: "noise_5_10",
    tier: 5,
    strand: "area",
    title: "Drawing Book Area",
    question_text: "A rectangular drawing book is 20 cm wide and 30 cm long. It has 40 pages. Find the area of a single page.",
    tokens: [
      { text: "A rectangular drawing book is", isNoise: false },
      { text: "20 cm", isNoise: false },
      { text: "wide and", isNoise: false },
      { text: "30 cm", isNoise: false },
      { text: "long.", isNoise: false },
      { text: "It has 40 pages.", isNoise: true },
      { text: "Find the area of a single page.", isNoise: false }
    ],
    explanation: "The total number of pages ('40 pages') is noise because we are only finding the area of a single page (width × length)."
  },

  // ================= TIER 6: RATIOS & PERCENTAGES =================
  {
    id: "noise_6_01",
    tier: 6,
    strand: "percentages",
    title: "Discount Offer",
    question_text: "A pair of Nike running shoes costs $80. It is on sale for 20% off. The discount coupon is printed on shiny paper. Find the sale price.",
    tokens: [
      { text: "A pair of Nike running shoes costs", isNoise: false },
      { text: "$80.", isNoise: false },
      { text: "It is on sale for", isNoise: false },
      { text: "20% off.", isNoise: false },
      { text: "The discount coupon is printed on shiny paper.", isNoise: true },
      { text: "Find the sale price.", isNoise: false }
    ],
    explanation: "The paper quality of the coupon ('printed on shiny paper') has no effect on the numeric discount calculation."
  },
  {
    id: "noise_6_02",
    tier: 6,
    strand: "ratios",
    title: "Mixing Paint",
    question_text: "To make purple paint, a painter mixes blue and red paint in a 3:2 ratio. The paint is acrylic. He uses 6 liters of blue paint. How much red paint is needed?",
    tokens: [
      { text: "To make purple paint, a painter mixes blue and red paint in a", isNoise: false },
      { text: "3:2", isNoise: false },
      { text: "ratio.", isNoise: false },
      { text: "The paint is acrylic.", isNoise: true },
      { text: "He uses", isNoise: false },
      { text: "6 liters", isNoise: false },
      { text: "of blue paint.", isNoise: false },
      { text: "How much red paint is needed?", isNoise: false }
    ],
    explanation: "The type of paint ('acrylic') is irrelevant information when solving a ratio proportion problem."
  },
  {
    id: "noise_6_03",
    tier: 6,
    strand: "percentages",
    title: "Sales Tax",
    question_text: "A jacket costs $50. The sales tax rate is 8%. The store manager is named David. What is the tax amount?",
    tokens: [
      { text: "A jacket costs", isNoise: false },
      { text: "$50.", isNoise: false },
      { text: "The sales tax rate is", isNoise: false },
      { text: "8%.", isNoise: false },
      { text: "The store manager is named David.", isNoise: true },
      { text: "What is the tax amount?", isNoise: false }
    ],
    explanation: "The name of the store manager is irrelevant noise."
  },
  {
    id: "noise_6_04",
    tier: 6,
    strand: "ratios",
    title: "Ratio of Apples",
    question_text: "The ratio of red apples to green apples in a box is 4:3. The box is made of wood. There are 12 green apples. Find the number of red apples.",
    tokens: [
      { text: "The ratio of red apples to green apples in a box is", isNoise: false },
      { text: "4:3.", isNoise: false },
      { text: "The box is made of wood.", isNoise: true },
      { text: "There are", isNoise: false },
      { text: "12", isNoise: false },
      { text: "green apples.", isNoise: false },
      { text: "Find the number of red apples.", isNoise: false }
    ],
    explanation: "The box material ('made of wood') is irrelevant fluff."
  },
  {
    id: "noise_6_05",
    tier: 6,
    strand: "percentages",
    title: "Class Attendance",
    question_text: "In a class of 30 students, 10% are absent. The classroom has 4 windows. How many students are absent?",
    tokens: [
      { text: "In a class of", isNoise: false },
      { text: "30", isNoise: false },
      { text: "students,", isNoise: false },
      { text: "10%", isNoise: false },
      { text: "are absent.", isNoise: false },
      { text: "The classroom has 4 windows.", isNoise: true },
      { text: "How many students are absent?", isNoise: false }
    ],
    explanation: "The number of windows in the classroom ('4 windows') is noise."
  },
  {
    id: "noise_6_06",
    tier: 6,
    strand: "ratios",
    title: "Speed Ratio",
    question_text: "The ratio of car speed to bike speed is 5:2. The car is painted red. The bike travels at 20 km/h. What is the speed of the car?",
    tokens: [
      { text: "The ratio of car speed to bike speed is", isNoise: false },
      { text: "5:2.", isNoise: false },
      { text: "The car is painted red.", isNoise: true },
      { text: "The bike travels at", isNoise: false },
      { text: "20 km/h.", isNoise: false },
      { text: "What is the speed of the car?", isNoise: false }
    ],
    explanation: "The car color ('painted red') is noise."
  },
  {
    id: "noise_6_07",
    tier: 6,
    strand: "percentages",
    title: "Price Mark-Up",
    question_text: "A store buys a book for $10 and marks up the price by 40%. The book is a best-seller. What is the mark-up amount?",
    tokens: [
      { text: "A store buys a book for", isNoise: false },
      { text: "$10", isNoise: false },
      { text: "and marks up the price by", isNoise: false },
      { text: "40%.", isNoise: false },
      { text: "The book is a best-seller.", isNoise: true },
      { text: "What is the mark-up amount?", isNoise: false }
    ],
    explanation: "The book's status ('best-seller') is irrelevant background information."
  },
  {
    id: "noise_6_08",
    tier: 6,
    strand: "ratios",
    title: "Map Scale",
    question_text: "The scale on a map is 1:100000. The map is printed in color. If two cities are 5 cm apart on the map, what is their actual distance in cm?",
    tokens: [
      { text: "The scale on a map is", isNoise: false },
      { text: "1:100000.", isNoise: false },
      { text: "The map is printed in color.", isNoise: true },
      { text: "If two cities are", isNoise: false },
      { text: "5 cm", isNoise: false },
      { text: "apart on the map,", isNoise: false },
      { text: "what is their actual distance in cm?", isNoise: false }
    ],
    explanation: "The map printing description ('printed in color') is noise."
  },
  {
    id: "noise_6_09",
    tier: 6,
    strand: "percentages",
    title: "Exam Score",
    question_text: "A student scored 80% on a test with 50 questions. The student studied for 3 hours. How many questions did they answer correctly?",
    tokens: [
      { text: "A student scored", isNoise: false },
      { text: "80%", isNoise: false },
      { text: "on a test with", isNoise: false },
      { text: "50", isNoise: false },
      { text: "questions.", isNoise: false },
      { text: "The student studied for 3 hours.", isNoise: true },
      { text: "How many questions did they answer correctly?", isNoise: false }
    ],
    explanation: "The time spent studying ('studied for 3 hours') is noise because the grade percentage and question count are already given."
  },
  {
    id: "noise_6_10",
    tier: 6,
    strand: "ratios",
    title: "Ratio of Staff",
    question_text: "The ratio of teachers to students in a school is 1:20. The school building has 3 floors. There are 400 students. How many teachers are there?",
    tokens: [
      { text: "The ratio of teachers to students in a school is", isNoise: false },
      { text: "1:20.", isNoise: false },
      { text: "The school building has 3 floors.", isNoise: true },
      { text: "There are", isNoise: false },
      { text: "400", isNoise: false },
      { text: "students.", isNoise: false },
      { text: "How many teachers are there?", isNoise: false }
    ],
    explanation: "The number of floors in the school ('3 floors') is irrelevant fluff."
  },

  // ================= TIER 7: DATA & PROBABILITY =================
  {
    id: "noise_7_01",
    tier: 7,
    strand: "probability",
    title: "Rolling a Die",
    question_text: "A standard 6-sided die is rolled once. The die is colored translucent red. What is the probability of rolling an even number?",
    tokens: [
      { text: "A standard 6-sided die is rolled once.", isNoise: false },
      { text: "The die is colored translucent red.", isNoise: true },
      { text: "What is the probability of rolling an even number?", isNoise: false }
    ],
    explanation: "The cosmetic coloring of the die ('translucent red') is noise since the probability depends only on faces and numbers."
  },
  {
    id: "noise_7_02",
    tier: 7,
    strand: "statistics",
    title: "Mean Score",
    question_text: "A student took 4 exams and scored 80, 85, 90, and 75. The student drank coffee before the exams. What is the mean score?",
    tokens: [
      { text: "A student took 4 exams and scored", isNoise: false },
      { text: "80, 85, 90, and 75.", isNoise: false },
      { text: "The student drank coffee before the exams.", isNoise: true },
      { text: "What is the mean score?", isNoise: false }
    ],
    explanation: "The student's diet choice ('drank coffee') is noise. Only the test scores are used to calculate the mean."
  },
  {
    id: "noise_7_03",
    tier: 7,
    strand: "probability",
    title: "Marbles in a Bag",
    question_text: "A canvas bag contains 5 green marbles and 3 blue marbles. The bag has a zipper. If you draw one marble, what is the probability it is green?",
    tokens: [
      { text: "A", isNoise: false },
      { text: "canvas", isNoise: true },
      { text: "bag contains", isNoise: false },
      { text: "5", isNoise: false },
      { text: "green marbles and", isNoise: false },
      { text: "3", isNoise: false },
      { text: "blue marbles.", isNoise: false },
      { text: "The bag has a zipper.", isNoise: true },
      { text: "If you draw one marble, what is the probability it is green?", isNoise: false }
    ],
    explanation: "Bag material ('canvas') and closure ('has a zipper') do not affect the color ratios."
  },
  {
    id: "noise_7_04",
    tier: 7,
    strand: "statistics",
    title: "Median Height",
    question_text: "Find the median of the heights: 150cm, 160cm, 155cm. The people measured were all wearing sneakers. What is the median?",
    tokens: [
      { text: "Find the median of the heights:", isNoise: false },
      { text: "150cm, 160cm, 155cm.", isNoise: false },
      { text: "The people measured were all wearing sneakers.", isNoise: true },
      { text: "What is the median?", isNoise: false }
    ],
    explanation: "Footwear information ('wearing sneakers') is irrelevant fluff."
  },
  {
    id: "noise_7_05",
    tier: 7,
    strand: "probability",
    title: "Coin Tosses",
    question_text: "A silver coin is tossed twice. The coin is a quarter. What is the probability of getting two heads?",
    tokens: [
      { text: "A", isNoise: false },
      { text: "silver", isNoise: true },
      { text: "coin is tossed twice.", isNoise: false },
      { text: "The coin is a quarter.", isNoise: true },
      { text: "What is the probability of getting two heads?", isNoise: false }
    ],
    explanation: "Coin composition ('silver') and denomination ('quarter') do not affect the independent probability of head/tail outcomes."
  },
  {
    id: "noise_7_06",
    tier: 7,
    strand: "statistics",
    title: "Temperature Range",
    question_text: "The temperatures recorded in a week were 20, 22, 25, 18, 21 degrees. The sky was mostly cloudy. Find the range of the temperatures.",
    tokens: [
      { text: "The temperatures recorded in a week were", isNoise: false },
      { text: "20, 22, 25, 18, 21 degrees.", isNoise: false },
      { text: "The sky was mostly cloudy.", isNoise: true },
      { text: "Find the range of the temperatures.", isNoise: false }
    ],
    explanation: "Weather descriptions ('sky was mostly cloudy') are noise."
  },
  {
    id: "noise_7_07",
    tier: 7,
    strand: "probability",
    title: "Drawing Cards",
    question_text: "A card is drawn from a standard deck of 52 cards. The cards were printed in Belgium. What is the probability of drawing an Ace?",
    tokens: [
      { text: "A card is drawn from a standard deck of", isNoise: false },
      { text: "52", isNoise: false },
      { text: "cards.", isNoise: false },
      { text: "The cards were printed in Belgium.", isNoise: true },
      { text: "What is the probability of drawing an Ace?", isNoise: false }
    ],
    explanation: "Manufacturing location ('printed in Belgium') is noise."
  },
  {
    id: "noise_7_08",
    tier: 7,
    strand: "statistics",
    title: "Mode of Data",
    question_text: "Find the mode of the numbers: 2, 3, 3, 4, 5. The numbers represent goals scored in games played on Saturdays. What is the mode?",
    tokens: [
      { text: "Find the mode of the numbers:", isNoise: false },
      { text: "2, 3, 3, 4, 5.", isNoise: false },
      { text: "The numbers represent goals scored in games played on Saturdays.", isNoise: true },
      { text: "What is the mode?", isNoise: false }
    ],
    explanation: "The meaning of the data ('goals scored in games played on Saturdays') is noise relative to the statistical definition of the mode."
  },
  {
    id: "noise_7_09",
    tier: 7,
    strand: "probability",
    title: "Spinner Sectors",
    question_text: "A circular spinner is divided into 4 equal sectors: red, blue, green, yellow. The spinner has a plastic arrow. Find the probability of spinning green.",
    tokens: [
      { text: "A circular spinner is divided into", isNoise: false },
      { text: "4", isNoise: false },
      { text: "equal sectors: red, blue, green, yellow.", isNoise: false },
      { text: "The spinner has a plastic arrow.", isNoise: true },
      { text: "Find the probability of spinning green.", isNoise: false }
    ],
    explanation: "The material of the spinner pointer ('plastic arrow') is noise."
  },
  {
    id: "noise_7_10",
    tier: 7,
    strand: "statistics",
    title: "Class Mean Height",
    question_text: "A group of 5 students has heights of 120cm, 130cm, 125cm, 140cm, 135cm. The students study Spanish. Find the mean height.",
    tokens: [
      { text: "A group of", isNoise: false },
      { text: "5", isNoise: false },
      { text: "students has heights of", isNoise: false },
      { text: "120cm, 130cm, 125cm, 140cm, 135cm.", isNoise: false },
      { text: "The students study Spanish.", isNoise: true },
      { text: "Find the mean height.", isNoise: false }
    ],
    explanation: "The subject studied ('Spanish') is completely irrelevant to calculating heights."
  },

  // ================= TIER 8: INTRODUCTORY ALGEBRA =================
  {
    id: "noise_8_01",
    tier: 8,
    strand: "algebra",
    title: "Solve for x",
    question_text: "Solve the linear equation 2x + 5 = 15. The letter x represents an unknown number. Al-Khwarizmi invented algebra. Find the value of x.",
    tokens: [
      { text: "Solve the linear equation", isNoise: false },
      { text: "2x + 5 = 15.", isNoise: false },
      { text: "The letter x represents an unknown number.", isNoise: true },
      { text: "Al-Khwarizmi invented algebra.", isNoise: true },
      { text: "Find the value of x.", isNoise: false }
    ],
    explanation: "The definition of x as an unknown variable and the historical fact about algebra are noise relative to the algebraic operations needed to solve for x."
  },
  {
    id: "noise_8_02",
    tier: 8,
    strand: "expressions",
    title: "Evaluating Expression",
    question_text: "Evaluate the expression 3y - 2 when y = 4. The variable y is written in italics. What is the value of the expression?",
    tokens: [
      { text: "Evaluate the expression", isNoise: false },
      { text: "3y - 2", isNoise: false },
      { text: "when", isNoise: false },
      { text: "y = 4.", isNoise: false },
      { text: "The variable y is written in italics.", isNoise: true },
      { text: "What is the value of the expression?", isNoise: false }
    ],
    explanation: "Typographical styling ('written in italics') is irrelevant to numerical evaluation."
  },
  {
    id: "noise_8_03",
    tier: 8,
    strand: "equations",
    title: "Apples Cost Equation",
    question_text: "Let a represent the cost of one apple. An apple is a healthy snack. 3 apples cost $6, so 3a = 6. What is the cost of one apple?",
    tokens: [
      { text: "Let a represent the cost of one apple.", isNoise: false },
      { text: "An apple is a healthy snack.", isNoise: true },
      { text: "3", isNoise: false },
      { text: "apples cost $6, so", isNoise: false },
      { text: "3a = 6.", isNoise: false },
      { text: "What is the cost of one apple?", isNoise: false }
    ],
    explanation: "Health advice ('An apple is a healthy snack') is noise."
  },
  {
    id: "noise_8_04",
    tier: 8,
    strand: "inequalities",
    title: "Solving Inequality",
    question_text: "Solve the inequality 4x > 12. The inequality sign points to the right. Find the range of values for x.",
    tokens: [
      { text: "Solve the inequality", isNoise: false },
      { text: "4x > 12.", isNoise: false },
      { text: "The inequality sign points to the right.", isNoise: true },
      { text: "Find the range of values for x.", isNoise: false }
    ],
    explanation: "Describing visual indicators ('points to the right') is logical noise."
  },
  {
    id: "noise_8_05",
    tier: 8,
    strand: "expressions",
    title: "Simplifying Expression",
    question_text: "Simplify the algebraic expression 5x + 2x - 3. The expression contains three terms. What is the simplified expression?",
    tokens: [
      { text: "Simplify the algebraic expression", isNoise: false },
      { text: "5x + 2x - 3.", isNoise: false },
      { text: "The expression contains three terms.", isNoise: true },
      { text: "What is the simplified expression?", isNoise: false }
    ],
    explanation: "Counting the terms in the original expression is noise when the goal is mathematical simplification."
  },
  {
    id: "noise_8_06",
    tier: 8,
    strand: "equations",
    title: "Double a Number",
    question_text: "If you double a number n and add 4, you get 14, so 2n + 4 = 14. The variable n stands for number. Find n.",
    tokens: [
      { text: "If you double a number n and add 4, you get 14, so", isNoise: false },
      { text: "2n + 4 = 14.", isNoise: false },
      { text: "The variable n stands for number.", isNoise: true },
      { text: "Find n.", isNoise: false }
    ],
    explanation: "Etymological naming definitions ('n stands for number') is noise."
  },
  {
    id: "noise_8_07",
    tier: 8,
    strand: "inequalities",
    title: "Inequality Evaluation",
    question_text: "Evaluate if x = 5 satisfies x + 2 < 10. The value of x is positive. Is the inequality satisfied?",
    tokens: [
      { text: "Evaluate if", isNoise: false },
      { text: "x = 5", isNoise: false },
      { text: "satisfies", isNoise: false },
      { text: "x + 2 < 10.", isNoise: false },
      { text: "The value of x is positive.", isNoise: true },
      { text: "Is the inequality satisfied?", isNoise: false }
    ],
    explanation: "Sign assertions ('value of x is positive') are noise because the algebraic calculation is self-sufficient."
  },
  {
    id: "noise_8_08",
    tier: 8,
    strand: "algebra",
    title: "Age Word Problem",
    question_text: "Sam is x years old. His brother is x + 3 years old. Sam was born in July. Find the sum of their ages in terms of x.",
    tokens: [
      { text: "Sam is x years old. His brother is x + 3 years old.", isNoise: false },
      { text: "Sam was born in July.", isNoise: true },
      { text: "Find the sum of their ages in terms of x.", isNoise: false }
    ],
    explanation: "Birth month ('born in July') is irrelevant noise for summing ages."
  },
  {
    id: "noise_8_09",
    tier: 8,
    strand: "equations",
    title: "Equation Solution",
    question_text: "Given the equation 3x = 18, find x. The coefficient of x is 3. Calculate the value of x.",
    tokens: [
      { text: "Given the equation", isNoise: false },
      { text: "3x = 18,", isNoise: false },
      { text: "find x.", isNoise: false },
      { text: "The coefficient of x is 3.", isNoise: true },
      { text: "Calculate the value of x.", isNoise: false }
    ],
    explanation: "Describing terminology ('The coefficient of x is 3') is noise."
  },
  {
    id: "noise_8_10",
    tier: 8,
    strand: "expressions",
    title: "Expression Terms",
    question_text: "For the expression 2a + 3b, substitute a = 3 and b = 2. The expression is linear. Find the final value.",
    tokens: [
      { text: "For the expression 2a + 3b, substitute", isNoise: false },
      { text: "a = 3", isNoise: false },
      { text: "and", isNoise: false },
      { text: "b = 2.", isNoise: false },
      { text: "The expression is linear.", isNoise: true },
      { text: "Find the final value.", isNoise: false }
    ],
    explanation: "The classification description ('The expression is linear') is noise for simple substitution."
  }
];

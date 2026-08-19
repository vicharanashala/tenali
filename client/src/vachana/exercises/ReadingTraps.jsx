import { useState, useEffect } from "react";
const LEVELS = [
  {
  id: 1,
  title: "Play & Read",
  questions: [
    {
      type: "tap",
      quiz: "Before you eat🍽️, wash your hands🧼.\nTap what happens first.",
      options: [
        { label: "🧼", value: "Wash" },
        { label: "🍽️", value: "Eat" },
        { label: "📖", value: "Read" },
        { label: "🛏️", value: "Sleep" }
      ],
      correct: "Wash",
      explanation: "Before eating, we wash our hands first."
    },

    {
  type: "tap",
  quiz: "🧍🏼‍♂️Aman gave Riya🧍🏼‍♀️ his toy🧸.\nWho got the toy?",
  options: [
    { label: "🧍🏼‍♂️", value: "Aman" },
    { label: "🧍🏼‍♀️", value: "Riya" },
    { label: "🧸 ", value: "Toy" },
    { label: "🧍🏼‍♂️🧍🏼‍♀️", value: "Both" }
  ],
  correct: "Riya",
  explanation: "Riya received the toy from Aman."
},

    {
      type: "tap",
      quiz: "Which animal is NOT a bird?",
      options: [
        { label: "🦜", value: "parrot" },
        { label: "🦉", value: "Owl" },
        { label: "🐶", value: "Dog" },
        { label: "🦩", value: "Flamingo" }
      ],
      correct: "Dog",
      explanation: "A dog is not a bird."
    },

    {
  type: "match",
  quiz: "Match the word to the picture.",

  words: [
    "Apple",
    "Ball",
    "Cat"
  ],

  emojis: [
    "🐱",
    "🍎",
    "⚽"
  ],

  correctMatches: [
    { text: "Apple", emoji: "🍎" },
    { text: "Ball", emoji: "⚽" },
    { text: "Cat", emoji: "🐱" }
  ],
   correct: "matched",
  explanation: 'Apple goes with 🍎, Ball goes with ⚽, and Cat goes with 🐱. We look at the word and find the picture that shows the same thing.'
},

   {
  type: "order",
  quiz: "Tap these in order.",
  items: [
    { emoji: "🏫", text: "Go to school" },
    { emoji: "🍽️", text: "Eat breakfast" },
    { emoji: "😴", text: "Wake up" },
    { emoji: "🪥", text: "Brush teeth" }
  ],
  correctOrder: [
    { emoji: "😴", text: "Wake up" },
    { emoji: "🪥", text: "Brush teeth" },
    { emoji: "🍽️", text: "Eat breakfast" },
    { emoji: "🏫", text: "Go to school" }
  ],
  correct: "correct-order",
  explanation: "We wake up, brush our teeth, eat, and then go to school."
},
  ]
},
  {
    id:2,
    title: "See the Math",
    questions: [
  {
  
  quiz: 'What happened?',

  questionVisual: ['⭐','⭐','⭐'],
  expressionText: '➕',
  rightVisual: ['⭐','⭐'],

  resultVisual: ['⭐','⭐','⭐','⭐','⭐'],

  options: [
    'Two less ⭐',
    'Double ⭐',
    'Same ⭐',
    'Two more ⭐'
  ],

  correct: 'Two more ⭐',

  explanation:
    'Adding means we put groups together. ⭐⭐⭐ + ⭐⭐ gives two more stars.'
},

  {
  type: 'drag-drop',
  showVisualRow: true,
  quiz: 'Drag the correct word into the box.',
  questionVisual: ['🍎','🍎','🍎','🍎'],
  expressionText: '➗ 2 = [ ❔ ]', 
  choices:[
    { label: '🍎🍎🍎', value: 'Less' },
    { label: '🍎🍎🍎🍎🍎', value: 'More' },
    { label: '🍎🍎', value: 'Half' },
    { label: '🍎🍎🍎🍎🍎🍎', value: 'Double' }
  ],
  correct: 'Half',
  explanation: 'Dividing by 2 makes half.'
},
{
  type: 'drag-drop',
  showVisualRow: true,
  quiz: 'Drag the correct result into the box.',
  questionVisual: ['🍎','🍎'],
  expressionText: '✖️ 2 = [ ❔ ]',

  choices: [
    { label: '🍎🍎🍎🍎', value: 'Double' },
    { label: '🍎🍎🍎', value: 'Less' },
    { label: '🍎🍎', value: 'Same' },
    { label: '🍎', value: 'Half' }
  ],

  correct: 'Double',

  explanation: 'Multiplying by 2 gives double.'
},
  {
  type: 'tap',
  quiz: 'Tap the correct symbol.',

  questionVisual: ['🐟','🐟','🐟'],
  expressionText: '[❔]',
  rightVisual: ['🐟','🐟','🐟'],

  options: [
    { label: '➕', value: 'plus' },
    { label: '➖', value: 'minus' },
    { label: '🟰', value: 'equal to' },
    { label: '✖️', value: 'into' }
  ],

  correct: 'equal to',

  explanation: 'Both groups have the same number, so we use =.'
},
 {
  type: 'input',
  quiz: 'Type the symbol that makes this true:',

  questionVisual: ['⭐','⭐','⭐','⭐'],
  expressionText: '❔',
  rightVisual: ['⭐','⭐'],

  correct: '>',

  placeholder: 'Type >, <, or =',

  explanation: '4 stars is greater than 2 stars.'
}
]
},
  {
  id: 3,
  title: "Crack the Code ",
  questions: [
    {
  type: 'drag-drop',
  showVisualRow: true,
  quiz: 'Drag the missing diamonds into the box.',

  questionVisual: ['💎','💎','💎'],
  expressionText: '➕ [ ❔ ] =',
  resultVisual: ['💎','💎','💎','💎','💎'],

  choices: [
    { label: '💎', value: '1 more' },
    { label: '💎💎', value: '2 more' },
    { label: '💎💎💎', value: '3 more' },
    { label: '💎💎💎💎', value: '4 more' }
  ],

  correct: '2 more',

  explanation: '3 diamonds plus 2 diamonds makes 5 diamonds.'
},

   {
  type: 'rocket-drop',

  quiz: 'Drag the rocket to a landing pad with a number that is 5 or bigger.',

  rocket: '🚀',

  targets: [
    { label: '7️⃣', value: '7' },
    { label: '1️⃣', value: '1' },
    { label: '3️⃣', value: '3' },
    { label: '4️⃣', value: '4' }
  ],

  correct: '7',

  explanation:
    '7 is greater than 5'
},

   {
  type: 'drag-drop',
  showVisualRow: true,
  quiz: '😋 The child is hungry. Drag the child toward the side with more pizza.',

   questionVisual: ['🍕','🍕','🍕','🍕','🍕','🍕'],
  expressionText: '[ ❔ ]',
  resultVisual: ['🍕','🍕','🍕'],

   choices: [
    { label: '🚶🏼‍♀️', value: '>' },
    { label: '🚶🏼‍♀️‍➡️', value: '<' },
    { label: '🤷🏼', value: '=' }
  ],

  correct: '>',

  explanation:
    'The left side has more pizza, so the child walks left.'
},

   {
  type: 'tap',

  quiz: '🏠 Mia lives between House 5 and House 10. Tap the house Mia can visit.',

  questionVisual: ['5️⃣','❔','🔟'],

  options: [
    { label: '🏠 4', value: 'before' },
    { label: '🏡 7', value: 'middle' },
    { label: '🏠 10', value: 'end' },
    { label: '🏠 11', value: 'after' }
  ],

  correct: 'middle',

  explanation:
    '7 is between 5 and 10 because it is in the middle.'
},
    {
  type: 'multi-tap',

  quiz: '🔐 The vault code must be "at most 20".\n\nTap all numbers that can unlock the vault.',

  options: [
    { label: '1️8', value: '18' },
    { label: '2️0', value: '20' },
    { label: '2️5', value: '25' },
    { label: '3️0', value: '30' }
  ],

  correct: ['18', '20'],

  explanation:
    '"At most 20" means the number can be 20 or any smaller value. 18 and 20 work, but 25 and 30 are too large.'
}
  ]
},
{
  id: 4,
  title: 'Cookie Clues',
  questions: [

    // Q1: 3 times as many
    {
      type: 'drag-drop',
      showVisualRow: true,
      quiz:
        'Tray B: 🍪\nTray A: Tray B × 3\nTray A: ?',

      choices: [
        { label: '🍪🍪🍪', value: '3' },
        { label: '🍪🍪', value: '2' },
        { label: '🍪🍪🍪🍪', value: '4' }
      ],

      correct: '3',

      explanation:
        'Tray B has 1 cookie. Three times Tray B means Tray A has 3 cookies.'
    },

    // Q2: 2 more than
    {
      type: 'drag-drop',
      showVisualRow: true,
      quiz:
        'Tray B: 🍪🍪\nTray A: Tray B + 2\nTray A: ?',

      choices: [
        { label: '🍪🍪🍪🍪', value: '4' },
        { label: '🍪🍪🍪', value: '3' },
        { label: '🍪🍪', value: '2' }
      ],

      correct: '4',

      explanation:
        'Tray B has 2 cookies. Adding 2 more gives Tray A 4 cookies.'
    },

    // Q3: 2 fewer than
    {
      type: 'drag-drop',
      showVisualRow: true,
      quiz:
        'Tray B: 🍪🍪🍪🍪🍪\nTray A: Tray B - 2\nTray A: ?',

      choices: [
        { label: '🍪🍪🍪', value: '3' },
        { label: '🍪🍪', value: '2' },
        { label: '🍪🍪🍪🍪', value: '4' }
      ],

      correct: '3',

      explanation:
        'Tray B has 5 cookies. Two fewer cookies means Tray A has 3 cookies.'
    },

    // Q4: Match sentence to expression
    {
      type: 'match',

      quiz: 'Match the sentence to the expression.',

      words: [
        'Tray A has 3 times as many cookies as Tray B',
        'Tray A has 2 more cookies than Tray B',
        'Tray A has 2 fewer cookies than Tray B'
      ],

      emojis: [
        'Tray A = Tray B × 3',
        'Tray A = Tray B - 2',
        'Tray A = Tray B + 2'
      ],

      correctMatches: [
        {
          text: 'Tray A has 3 times as many cookies as Tray B',
          emoji: 'Tray A = Tray B × 3'
        },
        {
          text: 'Tray A has 2 more cookies than Tray B',
          emoji: 'Tray A = Tray B + 2'
        },
        {
          text: 'Tray A has 2 fewer cookies than Tray B',
          emoji: 'Tray A = Tray B - 2'
        }
      ],

      correct: 'matched',

      explanation:
        '“Times” means multiply, “more than” means add, and “fewer than” means subtract.'
    },

    // Q5: Match sentence to expression
    {
      type: 'match',

      quiz: 'Match the sentence to the expression.',

      words: [
        'Tray A is half of Tray B',
        'Tray A has 3 more cookies than Tray B',
        'Tray A has twice as many cookies as Tray B'
      ],

      emojis: [
        'Tray A = Tray B + 3',
        'Tray A = Tray B × 2',
        'Tray A = Tray B ÷ 2'
      ],

      correctMatches: [
        {
          text: 'Tray A is half of Tray B',
          emoji: 'Tray A = Tray B ÷ 2'
        },
        {
          text: 'Tray A has 3 more cookies than Tray B',
          emoji: 'Tray A = Tray B + 3'
        },
        {
          text: 'Tray A has twice as many cookies as Tray B',
          emoji: 'Tray A = Tray B × 2'
        }
      ],

      correct: 'matched',

      explanation:
        'Half means divide by 2, more than means add, and twice means multiply by 2.'
    }
  ]
},
{
  id: 5,
  title: 'Order Matters',
  questions: [

    {
      title: 'Twice x, then minus 3',
      concept: 'Do the multiplication before subtraction.',
      quiz:
        'Start with twice x.\nThen take away 3.\n\nWhich expression matches?',

      options: [
        '3 - 2x',
        '2(x - 3)',
        '3x - 2',
        '2x - 3'
      ],

      correct: '2x - 3',

      explanation:
        'First make twice x (2x). Then subtract 3, so the expression is 2x - 3.'
    },

    {
      title: 'Multiply first, then add',
      concept: 'Find the product before adding.',
      quiz:
        'First find a × b.\nThen add 4.\n\nWhich expression matches?',

      options: [
        '(a + 4)b',
        '4ab',
        'ab + 4',
        'a(b + 4)'
      ],

      correct: 'ab + 4',

      explanation:
        'The product is ab. Adding 4 gives ab + 4.'
    },

    {
      title: 'Add first, then double',
      concept: 'The whole sum is multiplied by 2.',
      quiz:
        'First add x and y.\nThen multiply the total by 2.\n\nWhich expression matches?',

      options: [
        '2(x + y)',
        '2x + y',
        'x + 2y',
        'x + y + 2'
      ],

      correct: '2(x + y)',

      explanation:
        'Add x and y first. Then multiply the whole sum by 2.'
    },

    {
      title: 'Subtract first, then halve',
      concept: 'Find the difference before dividing.',
      quiz:
        'First find the difference between m and 6.\nThen divide that result by 2.\n\nWhich expression matches?',

      options: [
        'm - 3',
        'm/2 - 6',
        '(m - 6)/2',
        '(6 - m)/2'
      ],

      correct: '(m - 6)/2',

      explanation:
        'Find m - 6 first. Then divide the result by 2.'
    },

    {
      title: 'Add first, then square',
      concept: 'The entire sum is squared.',
      quiz:
        'First add x and 2.\nThen square the result.\n\nWhich expression matches?',

      options: [
        'x² + 2',
        '(x + 2)²',
        'x² + 4',
        '2x²'
      ],

      correct: '(x + 2)²',

      explanation:
        'Add x and 2 first. Then square the whole sum.'
    }
  ]
},
{
  id: 6,
  title: 'Read Between the Lines',
  questions: [

    {
      quiz: 'There are three times as many boys as girls.\nIf there are 12 boys, how many girls?',
      options: ['3', '4', '6', '36'],
      correct: '4',
      explanation: 'Three times as many boys means Boys = 3 × Girls.\n12 = 3 × Girls, so Girls = 12 ÷ 3 = 4.'
    },

    {
      quiz: 'There are 2 more cookies in Tray A than Tray B.\nTray B has 3 cookies.\nHow many cookies are in Tray A?',
      options: ['3', '4', '5', '6'],
      correct: '5',
      explanation: 'Tray A has 2 more cookies than Tray B.\nTray B has 3 cookies, so Tray A = 3 + 2 = 5 cookies.'
    },

    {
      quiz: 'There are 2 fewer cats than dogs.\nThere are 7 dogs.\nHow many cats are there?',
      options: ['5', '7', '9', '14'],
      correct: '5',
      explanation: 'Cats are 2 fewer than dogs.\nDogs = 7, so Cats = 7 - 2 = 5.'
    },

    {
      quiz: 'There are twice as many students as teachers.\nThere are 10 students.\nHow many teachers are there?',
      options: ['5', '10', '15', '20'],
      correct: '5',
      explanation: 'Twice as many students means Students = 2 × Teachers.\n10 = 2 × Teachers, so Teachers = 10 ÷ 2 = 5.'
    },

    {
      quiz: 'Tray A has 3 more cookies than Tray B.\nTray B has 2 cookies.\nHow many cookies are in Tray A?',
      options: ['3', '4', '5', '6'],
      correct: '5',
      explanation: 'Tray A has 3 more cookies than Tray B.\nTray B has 2 cookies, so Tray A = 2 + 3 = 5 cookies.'
    }
  ]
},
  {
  id: 7,
  title: 'Boundary Detective',
  questions: [

    // Q1: Tap
    {
      type: 'tap',

      quiz:
        '🎟️ Ticket counter sign:\nTickets 1 to 5 are available today.\n\nCan someone choose ticket 4?',

      options: [
  { label: '✅', value: 'Yes' },
  { label: '❌', value: 'No' }
],

      correct: 'Yes',

      explanation:
        'Ticket 4 is part of the range 1 to 5.'
    },

    // Q2: Tap
    {
      type: 'tap',

      quiz:
        '🔒 Locker notice:\nUse lockers between 10 and 20 only.\n\nCan you use locker 20?',

      options: [
  { label: '✅', value: 'Yes' },
  { label: '❌', value: 'No' }
],

      correct: 'No',

      explanation:
        '“Between 10 and 20” leaves out the end lockers.'
    },

    // Q3: Drag
    {
      type: 'rocket-drop',

      quiz:
        '💰A treasure chest is locked.\nThe key works only on a number between 1 and 5.\n\nDrag the key to a number that opens the chest.',

      rocket: '🗝️',

      targets: [
        { label: '1️⃣', value: '1' },
        { label: '2️⃣', value: '2' },
        { label: '5️⃣', value: '5' },
        { label: '6️⃣', value: '6' }
      ],

      correct: '2',

      explanation:
        '2 is between 1 and 5. The end numbers 1 and 5 do not open the chest.'
    },

    // Q4: Input
    {
      type: 'input',

      quiz:
        '🗺️ A map says the treasure is hidden at a number between 3 and 7.\nType one possible hiding place.',

      placeholder: 'Type a number',

      correctAnswers: ['4', '5', '6'],

      explanation:
        '4, 5, or 6 are all between 3 and 7.'
    },

    // Q5: Input
    {
      type: 'input',

      quiz:
        '🎟️ A concert uses reserved seats 12 to 15.\nType one reserved seat number.',

      placeholder: 'Type a seat number',

      correctAnswers: ['12', '13', '14', '15'],

      explanation:
        '12, 13, 14, and 15 are all reserved seats.'
    }
  ]
},
  {
  id: 8,
  title: "Master Challenge",
  questions: [
    {
      quiz: 'Which expression represents "five less than the sum of x and y"?',
      options: [
        "5 - (x + y)",
        "x + (y - 5)",
         "(x + y) - 5",
        "(x - 5) + y"
      ],
      correct: "(x + y) - 5",
      explanation:
        'Find the sum first, then subtract 5.'
    },

    {
      quiz: "There are three times as many apples as bananas.\nThere are 12 bananas.\n\nRiya says there are 15 apples.\nIs she correct?",
      options: [
        "No, there are 24 apples.",
         "No, there are 36 apples.",
        "Yes",
        "No, there are 48 apples."
      ],
      correct: "No, there are 36 apples.",
      explanation:
        "Three times as many means 3 × 12 = 36."
    },

    {
      quiz: 'A game has levels 5 to 12.\nYou must play every level "from 5 to 12 inclusive".\n\nHow many levels will you play?',
      options: [
        "7",
        "8",
        "9",
        "12"
      ],
      correct: "8",
      explanation:
        "Inclusive means count both 5 and 12."
    },

    {
      quiz: "A basket has 8 oranges.\nAnother basket has twice as many oranges.\nThen 3 more oranges are added.\n\nHow many oranges are in the second basket?",
      options: [
        "16",
        "19",
        "11",
        "22"
      ],
      correct: "19",
      explanation:
        "Twice 8 is 16. Then add 3 to get 19."
    },

    {
      quiz: 'A number is "three less than twice x".\nIf x = 8,\nwhat is the value?',
      options: [
        "13",
        "16",
        "19",
        "21"
      ],
      correct: "13",
      explanation:
        "Translate first: 2x − 3. Then substitute x = 8."
    }
  ]
},
];
function EmojiRow({ emojis }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        margin: '8px 0',
      }}
    >
      {emojis.map((emoji, index) => (
        <div
          key={index}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.8rem',
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}
export default function ReadingTraps() {
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState(null);
  const [msg, setMsg] = useState('');
  const [currentScreen, setCurrentScreen] = useState('levels');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedTap, setSelectedTap] = useState(null);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [orderSelection, setOrderSelection] = useState([]);
  const [draggedChoice, setDraggedChoice] = useState(null);
  const [dropAnswer, setDropAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [multiAns, setMultiAns] = useState([]);
  const currentLevel = LEVELS.find(level => level.id === selectedLevel);
  const questions = currentLevel?.questions || [];
  useEffect(() => {
  if (currentScreen !== "quiz") return;
  if (checked) return;

  const timer = setTimeout(() => {
    if (idx < questions.length - 1) {
      setIdx((prev) => prev + 1);
      setAns(null);
      setMsg("");
      setChecked(false);
    } else {
      setChecked(true);
      setCurrentScreen("results");
    }
  }, 20000);

  return () => clearTimeout(timer);
}, [idx, checked, currentScreen, questions.length]);
const check = (a) => {
  setAns(a);
  setChecked(true);

  const currentQuestion = questions[idx];

const isCorrect = currentQuestion.correctAnswers
  ? currentQuestion.correctAnswers.includes(a)
  : Array.isArray(currentQuestion.correct)
  ? a === 'multi-correct'
  : a === currentQuestion.correct;

if (isCorrect) {
  setScore(score + 1);
  setMsg("✅ Correct! " + questions[idx].explanation);
} else {
  setMsg("❌ Incorrect. " + questions[idx].explanation);
}
};
  if (currentScreen === "overview") {
  return (
    <div
      style={{
        background: "var(--clr-surface)",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid var(--clr-border)",
      }}
      
    >
      <h2 style={{ color: "var(--clr-accent)" }} align = "center">Reading Traps</h2><br></br>

      <h3>What are Reading Traps?</h3>

        <p>Reading traps are common mathematical phrases that are easy to misunderstand.
        Learning to recognize them helps you interpret questions correctly before solving them.</p><br></br>

      <h3>Why is it important?</h3>

        <p>Many mistakes in mathematics happen before calculations begin.
        Understanding the wording correctly is just as important as solving the problem..</p><br></br>

     <div style={{ display: "flex", justifyContent: "center" }}>
  <button
    className="submit-btn"
    onClick={() => setCurrentScreen('levels')}
  >
    Levels
  </button>
  
</div>

    </div>
  );
}
if (currentScreen === "levels") {
  return (
    <div>
      <h2
        style={{
          color: "var(--clr-accent)",
          textAlign: "center",
        }}
      >
        Reading Traps
      </h2>

      <p
        style={{
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        Select a Reading Traps level to begin.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginTop: "24px",
        }}
      >
        {LEVELS.map((level) => (
          <div
            key={level.id}
            onClick={() => {
              setSelectedLevel(level.id);
              setCurrentScreen("quiz");
            }}
            onMouseEnter={() => setHoveredLevel(level.id)}
            onMouseLeave={() => setHoveredLevel(null)}
            style={{
              background:
                hoveredLevel === level.id
                  ? "var(--clr-card)"
                  : "var(--clr-surface)",
                      border:
                        hoveredLevel === level.id
                          ? "1px solid var(--clr-accent)"
                          : "1px solid var(--clr-border)",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              height:"100%",
            transform:
              hoveredLevel === level.id
                ? "translateY(-3px)"
                : "translateY(0)",

            boxShadow:
              hoveredLevel === level.id
                ? "0 8px 24px rgba(0,0,0,0.18)"
                : "none",
              transition: "all 0.2s ease",
            }}
          >
            {/* Title */}
           <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.15rem",
                  color: "var(--clr-accent)",
                  fontWeight: "700",
                }}
              >
                {level.title}
              </h3>
            </div>

            <p
              style={{
                margin: "0 0 14px 0",
                fontSize: "0.8rem",
                opacity: 0.7,
                textTransform: "uppercase",
                letterSpacing: "1px",
                textAlign: "center",
              }}
            >
              Level {level.id}
            </p>

            <p
              style={{
                margin: 0,
                lineHeight: "1.5",
              }}
            >
            </p>
          </div>
        ))}
      </div>
      <button
        className="submit-btn"
        onClick={() => setCurrentScreen("overview")}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          padding: 0,
          fontSize: "1.3rem",
        }}
      >
        👀
      </button>
    </div>
    
  );
}
if (currentScreen === "quiz") {
  const q = questions[idx];
  const isTapQuestion = q.type === "tap";
  const isMatchQuestion = q.type === "match";
  const isOrderQuestion = q.type === "order";
  const isDragQuestion = q.type === 'drag-drop';
  const isInputQuestion = q.type === 'input';
  const isRocketDropQuestion = q.type === 'rocket-drop';
  const isMultiTapQuestion = q.type === 'multi-tap';
  return (
    <div>

      <div style={{ background: "var(--clr-surface)",
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid var(--clr-border)",
    display: "flex",
    flexDirection: "column",
    marginBottom:"10px",
    alignItems: "center",
    textAlign: "center", }}>
      <div
  style={{
    width: "100%",
    marginBottom: "2px",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "14px",
    }}
  >
    <button
      onClick={() => {
        setCurrentScreen("levels");
        setIdx(0);
        setAns(null);
        setMsg("");
        setChecked(false);
      }}
      style={{
        padding: "6px 14px",
        fontSize: "0.85rem",
        borderRadius: "8px",
        border: "1px solid var(--clr-border)",
        background: "var(--clr-surface)",
        cursor: "pointer",
      }}
    >
      ← Back to Levels
    </button>

    <span
      style={{
        fontSize: "0.95rem",
        fontWeight: "600",
        opacity: 0.75,

      }}
    >
      Question {idx + 1} of {questions.length}
    </span>
  </div>

  <div
    style={{
      width: "100%",
      height: "8px",
      background: "var(--clr-border)",
      borderRadius: "999px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${((idx + 1) / questions.length) * 100}%`,
        height: "100%",
        background: "var(--clr-accent)",
      }}
    />
  </div>
</div>
<h3
  style={{
    margin: "0 0 6px 0",
    fontSize: "1.15rem",
    color: "var(--clr-accent)",
  }}
>
</h3>
        {q.title && (
  <h3
    style={{
      margin: '0 0 6px 0',
      fontSize: '1.15rem',
      color: 'var(--clr-accent)'
    }}
  >
    {q.title}
  </h3>
)}

{q.concept && (
  <p
    style={{
      margin: '0 0 12px 0',
      fontSize: '0.95rem',
      lineHeight: '1.5'
    }}
  >
    {q.concept}
  </p>
)}
        
      </div>
      <div style={{ background: "var(--clr-surface)",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid var(--clr-border)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    
     }}>
        <p
  style={{
    margin: "8px 0 16px 0",
    fontSize: "1.25rem",
    fontWeight: 700,
    lineHeight: "1.5",
    textAlign: "center",
    maxWidth: "700px",
    whiteSpace: "pre-line",
  }}
>
  {q.quiz}
</p>
{q.helperText && (
  <p
    style={{
      margin: '0 0 14px 0',
      fontSize: '1rem',
      fontWeight: 700,
      color: 'var(--clr-accent)',
      textAlign: 'center'
    }}
  >
    {q.helperText}
  </p>
)}
{q.questionVisual && (!isDragQuestion || q.showVisualRow) && (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'nowrap',
      marginBottom: '14px',
    }}
  >


    {/* Left visual */}
    {q.questionVisual.map((emoji, index) => (
      <div
        key={`left-${index}`}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.8rem',
        }}
      >
        {emoji}
      </div>
    ))}

    {/* Expression */}
    <div
      style={{
        fontSize: '1.8rem',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        margin: '0 4px',
      }}
    >
      {q.expressionText}
    </div>

    {/* Right visual */}
    {q.rightVisual &&
      q.rightVisual.map((emoji, index) => (
        <div
          key={`right-${index}`}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.8rem',
          }}
        >
          {emoji}
        </div>
      ))}

    {/* Result visual */}
    {q.resultVisual && (
      <>
        <div
          style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            margin: '0 4px',
          }}
        >
          →
        </div>

        {q.resultVisual.map((emoji, index) => (
          <div
            key={`result-${index}`}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '1.8rem',
            }}
          >
            {emoji}
          </div>
        ))}
      </>
    )}

  </div>
)}
{isMatchQuestion ? (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      width: '100%',
      maxWidth: '700px',
      marginBottom: '20px',
      alignItems: 'start',
    }}
  >

    {/* LEFT COLUMN - WORDS */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {q.words.map((word) => {
        const alreadyMatched = matchedPairs.some(
          (pair) => pair.text === word
        );

        return (
          <button
            key={word}
            disabled={alreadyMatched}
            onClick={() => setSelectedLeft(word)}
            style={{
              width: '100%',
              minHeight: '90px',
              borderRadius: '20px',
              border:
                selectedLeft === word
                  ? '2px solid var(--clr-accent)'
                  : '1px solid var(--clr-border)',
              background:
                selectedLeft === word
                  ? 'rgba(255,145,77,0.12)'
                  : 'var(--clr-surface)',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: alreadyMatched ? 'default' : 'pointer',
              opacity: alreadyMatched ? 0.6 : 1,
              transition: '0.2s ease',
            }}
          >
            {word}
          </button>
        );
      })}
    </div>

    {/* RIGHT COLUMN - EMOJIS */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {q.emojis.map((emoji) => {
        const alreadyUsed = matchedPairs.some(
          (pair) => pair.emoji === emoji
        );

        return (
          <button
            key={emoji}
            disabled={alreadyUsed || !selectedLeft}
            onClick={() => {
              setMatchedPairs((prev) => [
                ...prev,
                { text: selectedLeft, emoji }
              ]);
              setSelectedLeft(null);
            }}
            style={{
              width: '100%',
              minHeight: '90px',
              borderRadius: '20px',
              border: '1px solid var(--clr-border)',
              background: 'var(--clr-surface)',
              fontSize: '2rem',
              cursor:
                alreadyUsed || !selectedLeft
                  ? 'default'
                  : 'pointer',
              opacity: alreadyUsed ? 0.6 : 1,
              transition: '0.2s ease',
            }}
          >
            {emoji}
          </button>
        );
      })}
    </div>

  </div>
) : isOrderQuestion ? (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "25px",
      justifyContent: "center",
      marginBottom: "20px",
      width: "100%",
      maxWidth: "700px",
    }}
  >
    {q.items.map((item) => {
      const selected = orderSelection.some(
  (selectedItem) => selectedItem.emoji === item.emoji
);
      return (
        <button
          key={item.emoji}
          disabled={(checked && !isOrderQuestion) || selected}
          onClick={() => {
            if (!selected) {
              setOrderSelection((prev) => [...prev, item]);
            }
          }}
          style={{
            minWidth: "110px",
            minHeight: "110px",
            padding: "16px",
            borderRadius: "22px",
            border: selected
              ? "2px solid var(--clr-accent)"
              : "1px solid var(--clr-border)",
            background: selected
              ? "rgba(255,145,77,0.12)"
              : "var(--clr-surface)",
            fontSize: "1.2rem",
            fontWeight: 700,
            cursor: checked || selected ? "default" : "pointer",
            transition: "0.2s ease",
          }}
        >
          <div>
  <span>{item.emoji}</span>
  <p>{item.text}</p>
</div>
        </button>
      );
    })}
  </div>
) : isDragQuestion ? (
  <div
    style={{
      width: '100%',
      maxWidth: '520px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '18px',
      marginBottom: '20px',
    }}
  >
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => setDropAnswer(draggedChoice)}
      style={{
        width: '220px',
        minHeight: '80px',
        border: '2px dashed var(--clr-accent)',
        borderRadius: '18px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.1rem',
        fontWeight: 700,
        background: 'rgba(255,145,77,0.08)',
      }}
    >
     {dropAnswer ? (
  <div style={{ fontSize: '1.6rem' }}>
    {q.choices.find(c => c.value === dropAnswer)?.label}
  </div>
) : (
  'Drop here'
)}
    </div>

    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '12px',
      }}
    >
      {q.choices.map((choice) => (
  <div
    key={choice.value}
    draggable={!checked}
    onDragStart={() => {
      if (!checked) setDraggedChoice(choice.value);
    }}
    style={{
      padding: '12px 18px',
      borderRadius: '16px',
      border: '1px solid var(--clr-border)',
      background: 'var(--clr-surface)',
      cursor: checked ? 'default' : 'grab',
      opacity: checked ? 0.6 : 1,
      userSelect: 'none',
      pointerEvents: checked ? 'none' : 'auto',
      minWidth: '120px',
      textAlign: 'center',
    }}
  >
    <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  }}
>
  <span
    style={{
      fontSize: '1.3rem',
      fontWeight: 700,
      textAlign: 'center',
    }}
  >
    {choice.label}
  </span>

  <span
    style={{
      fontSize: '0.9rem',
      fontWeight: 600,
      textAlign: 'center',
      opacity: 0.9,
    }}
  >
    {choice.value}
  </span>
</div>
  </div>
))}
    </div>

  </div>
) : isRocketDropQuestion ? (
  <div
    style={{
      width: '100%',
      maxWidth: '520px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '20px',
    }}
  >

    {/* Draggable rocket */}
    <div
      draggable={!checked}
      onDragStart={() => !checked && setDraggedChoice('rocket')}
      style={{
        width: '84px',
        height: '84px',
        borderRadius: '22px',
        border: '1px solid var(--clr-border)',
        background: 'var(--clr-surface)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '2.5rem',
        cursor: checked ? 'default' : 'grab',
        opacity: checked ? 0.6 : 1,
      }}
    >
      {q.rocket}
    </div>

    {/* Drop targets */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
        gap: '16px',
        width: '100%',
      }}
    >
      {q.targets.map((target) => (
        <div
          key={target.value}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (!checked && draggedChoice === 'rocket') {
              setAns(target.value);
            }
          }}
          style={{
            minHeight: '100px',
            borderRadius: '20px',
            border:
              ans === target.value
                ? '2px solid var(--clr-accent)'
                : '2px dashed var(--clr-border)',
            background:
              ans === target.value
                ? 'rgba(255,145,77,0.12)'
                : 'var(--clr-surface)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '2rem',
            transition: '0.2s ease',
          }}
        >
          {target.label}
        </div>
      ))}
    </div>

  </div>
) : isInputQuestion ? (
  <div
    style={{
      width: '100%',
      maxWidth: '420px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '18px',
      marginBottom: '20px',
    }}
  >

    <div
      style={{
        fontSize: '2rem',
        fontWeight: 700,
        textAlign: 'center',
      }}
    >
      {q.prompt}
    </div>

    <input
  type="text"
  value={textAnswer}
  onChange={(e) => setTextAnswer(e.target.value)}
  placeholder={q.placeholder}
  maxLength={2}
  style={{
    width: '140px',
    height: '64px',
    textAlign: 'center',
    fontSize: '2rem',
    fontWeight: 700,
    borderRadius: '16px',
    border: '2px solid var(--clr-border)',
    background: 'var(--clr-surface)',
    color: 'inherit',
    outline: 'none',
  }}
/>

  </div>
) : isMultiTapQuestion ? (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(140px, 180px))',
      gap: '16px',
      justifyContent: 'center',
      marginBottom: '20px',
      width: '100%',
    }}
  >
    {q.options.map((opt) => {
      const selected = multiAns.includes(opt.value);

      return (
        <button
          key={opt.value}
          disabled={checked}
          onClick={() => {
            if (checked) return;

            setMultiAns(prev =>
              prev.includes(opt.value)
                ? prev.filter(v => v !== opt.value)
                : [...prev, opt.value]
            );
          }}
          style={{
            minHeight: '120px',
            padding: '18px',
            borderRadius: '22px',
            border: selected
              ? '2px solid var(--clr-accent)'
              : '1px solid var(--clr-border)',
            background: selected
              ? 'rgba(255,145,77,0.12)'
              : 'var(--clr-surface)',
            cursor: checked ? 'default' : 'pointer',
            transition: '0.2s ease',
            fontSize: '1.2rem',
            fontWeight: 700,
          }}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
) : isTapQuestion ? (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(140px, 180px))",
      gap: "16px",
      justifyContent: "center",
      marginBottom: "20px",
      width: "100%",
    }}
  >
    {q.options.map((opt) => (
      <button
  key={opt.value}
  onClick={() => {
    if (!checked) setAns(opt.value);
  }}
  disabled={checked && q.type === "tap"}
  style={{
    minHeight: "140px",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderRadius: "24px",
    border:
      ans === opt.value
        ? "2px solid var(--clr-accent)"
        : "1px solid rgba(255,255,255,0.10)",
    background:
      ans === opt.value
        ? "rgba(255,145,77,0.16)"
        : "rgba(255,255,255,0.03)",
    boxShadow:
      ans === opt.value
        ? "0 0 0 4px rgba(255,145,77,0.10)"
        : "0 4px 16px rgba(0,0,0,0.15)",
    color: "inherit",
    cursor: checked ? "default" : "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    }}
  >
    <span style={{ fontSize: "2rem" }}>
      {opt.label}
    </span>

    <span
      style={{
        fontSize: "0.95rem",
        fontWeight: 600,
      }}
    >
      {opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
    </span>
  </div>
</button>
    ))}
  </div>
) : (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      marginBottom: "20px",
      width: "100%",
    }}
  >
    {questions[idx].options.map((opt, index) => (
      <button
        key={index}
        disabled={checked}
        onClick={() => setAns(opt)}
        style={{
          width: "100%",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "16px",
          border:
            ans === opt
              ? "2px solid var(--clr-accent)"
              : "1px solid var(--clr-border)",
          background:
            ans === opt
              ? "rgba(255,145,77,0.12)"
              : "var(--clr-surface)",
          color: "inherit",
          cursor: checked ? "default" : "pointer",
          transition: "0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,.08)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            {index + 1}
          </div>

          <span
            style={{
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {opt}
          </span>
        </div>
      </button>
    ))}
  </div>
)}
        {!checked && (
  <div style={{ marginBottom: "16px" }}>
    <button
      className="submit-btn"
      disabled={
  isMatchQuestion
    ? matchedPairs.length !== q.correctMatches.length
    : isOrderQuestion
    ? orderSelection.length !== q.correctOrder.length
    : isDragQuestion
    ? !dropAnswer
    : isMultiTapQuestion
    ? multiAns.length === 0
    : isInputQuestion
    ? !textAnswer.trim()
    : isRocketDropQuestion
    ? !ans
    : !ans
}
      onClick={() => {
  if (isMatchQuestion) {
    const correct = 
      JSON.stringify(
        matchedPairs.sort((a,b)=>a.text.localeCompare(b.text))
      ) ===
      JSON.stringify(
        q.correctMatches.sort((a,b)=>a.text.localeCompare(b.text))
      );

    check(correct ? 'matched' : 'wrong-match');

  } else if (isOrderQuestion) {
    const correct =
      JSON.stringify(orderSelection) ===
      JSON.stringify(q.correctOrder);

    check(correct ? 'correct-order' : 'wrong-order');

  } else if (isDragQuestion) {
    check(dropAnswer);
  
  } else if (isInputQuestion) {
  const answer = textAnswer.trim();

  if (q.correctAnswers) {
    check(q.correctAnswers.includes(answer) ? answer : 'wrong');
  } else {
    check(answer);
  }
}
   else if (isMultiTapQuestion) {
  const correct =
    JSON.stringify([...multiAns].sort()) ===
    JSON.stringify([...q.correct].sort());

  check(correct ? 'multi-correct' : 'multi-wrong');

  } else if (isRocketDropQuestion) {
  check(ans);

  } else {
    check(ans);
  }
}}
    >
      Submit
    </button>
  </div>
)}
        {msg && <span style={{ fontSize: '0.9rem', color: msg.startsWith('✅') ? 'var(--clr-correct)' : 'red' }}>{msg}</span>}
        {checked && (
  <div style={{ marginTop: "18px" }}>
    <button
      className="submit-btn"
      onClick={() => {
        if (idx === questions.length - 1) {
          setCurrentScreen("results");
        } else {
          setIdx(idx + 1);
          setAns(null);
          setMsg("");
          setChecked(false);
          setSelectedTap(null);
          setMatchedPairs([]);      
          setOrderSelection([]);   
          setDropAnswer('');
          setTextAnswer('');
          setDraggedChoice(null);
          setMultiAns([]);
          
        }
      }}
    >
      {idx === questions.length - 1
        ? "Finish Level"
        : "Next Question →"}
    </button>
  </div>
)}
      </div>
    </div>
  );
}
if (currentScreen === "results") {
  return (
    <div
      style={{
        background: "var(--clr-surface)",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid var(--clr-border)",
        textAlign: "center",
      }}
    >
      <h2
  style={{
    color: "var(--clr-accent)",
    marginBottom: "8px",
  }}
>
   Level Complete
</h2>

      <p
  style={{
    fontSize: "1.15rem",
    fontWeight: "600",
    marginBottom: "28px",
  }}
>
  {currentLevel.title}
</p>

      <h1
  style={{
    fontSize: "3rem",
    margin: "0",
    color: "var(--clr-accent)",
  }}
>
  {score}/{questions.length}
</h1>

<p
  style={{
    marginTop: "8px",
    fontSize: "1rem",
    opacity: 0.8,
  }}
>
  You answered {score} out of {questions.length} questions correctly.
</p>
<p
  style={{
    marginTop: "20px",
    marginBottom: "30px",
    fontWeight: "600",
  }}
>
  Accuracy: {Math.round((score / questions.length) * 100)}%
</p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginTop: "24px",
          flexWrap: "wrap",
        }}
      >
        <button
          className="submit-btn"
          onClick={() => {
            setIdx(0);
            setScore(0);
            setAns(null);
            setChecked(false);
            setMsg("");
            setCurrentScreen("quiz");
          }}
        >
          Retry Level
        </button>

        <button
          className="submit-btn"
          onClick={() => {
            setIdx(0);
            setScore(0);
            setAns(null);
            setChecked(false);
            setMsg("");
            setCurrentScreen("levels");
          }}
        >
          Back to Levels
        </button>

        {selectedLevel < LEVELS.length && (
          <button
            className="submit-btn"
            onClick={() => {
              setSelectedLevel(selectedLevel + 1);
              setIdx(0);
              setScore(0);
              setAns(null);
              setChecked(false);
              setMsg("");
              setCurrentScreen("quiz");
            }}
          >
            Next Level →
          </button>
        )}
      </div>
    </div>
  );
}
}


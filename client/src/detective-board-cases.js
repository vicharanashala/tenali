/**
 * DETECTIVE BOARD CASES — data only.
 *
 * The Narrative engine: fully authored board-case specs for the Math
 * Detective Agency's crime-scene case type. Cases 2 & 3 (the elephant
 * mastermind arc) are future pure-data additions in this file — the
 * engine (`detective-board-engine.js`) is complete and unchanged.
 *
 * All specs are validated by `validateBoardCase` at dev load and in tests.
 */

import { validateBoardSpec } from './detective-board-engine';

// ─── Case 1 — The Vanished Birthday Cupcakes ─────────────────────────
// Greenleaf Animal School, baking celebration day. The class cupcakes
// vanished minutes before snack time. Warm, low-stakes, no villainy.

export const BOARD_CASE_1 = {
  type: 'board',
  id: 'board-1',
  caseNumber: 1,
  title: 'The Vanished Birthday Cupcakes',
  description: 'The class cupcakes vanished before snack time. Can you crack the case?',
  difficulty: 1,
  xpReward: 60,
  topic: 'adventure',
  skillFamily: 'addsub',
  ageRange: [6, 9],
  gridSize: 12,
  blocked: [
    [1, 1], [2, 1], [3, 1], [1, 2], // the school pond
    [10, 8], [10, 9], [11, 9],      // the garden fence
  ],
  playerStart: [6, 6],
  briefing:
    'The cupcakes vanished before snack time! Walk the school, Detective — step on anything interesting and find the thief!',

  suspects: [
    {
      id: 'leo', name: 'Leo', animalEmoji: '🦁', species: 'lion',
      hint: 'Loves chocolate. A bit of a show-off.',
      profile: { favouriteFood: 'chocolate', footprint: '16 cm', colour: 'golden mane', timing: 'led gym at 9:40' },
      eliminatedReason: "He was leading gym at 9:40 in front of the whole class — not in the kitchen.",
    },
    {
      id: 'mila', name: 'Mila', animalEmoji: '🐭', species: 'mouse',
      hint: 'Tiny, quiet and shy.',
      profile: { favouriteFood: 'cheese', footprint: '4 cm', colour: 'grey fur', timing: 'on time' },
      eliminatedReason: "Only 4 cm paws — too tiny for a 15 cm print.",
    },
    {
      id: 'teddy', name: 'Teddy', animalEmoji: '🐻', species: 'bear',
      hint: 'Big, clumsy, forgetful. Leaves mud everywhere.',
      profile: { favouriteFood: 'honey', footprint: '18 cm', colour: 'brown fur', timing: 'late (after the rain)' },
      eliminatedReason: "His prints were old and dry — the kitchen trail was fresh and wet.",
    },
    {
      id: 'riya', name: 'Riya', animalEmoji: '🐰', species: 'rabbit',
      hint: 'Quick, eager to please, always watching the clock.',
      profile: { favouriteFood: 'carrots', footprint: '9 cm', colour: 'white fur', timing: 'early, always' },
      eliminatedReason: "She wanted to surprise the teacher — she just forgot to ask first.",
    },
  ],
  culprit: 'riya',

  objects: [
    {
      id: 'footprints',
      cell: [2, 3], emoji: '🦶', name: 'Footprints by the door',
      category: 'identity',
      clueType: 'investigation',
      investigation: {
        hints: [
          'Use the little ruler on your badge. Measure the front part and the back part together.',
          'The front part is 8 cm and the back part is 7 cm. What is 8 + 7?',
        ],
        math: {
          easy: {
            narrative: 'Two clear prints lead to the kitchen door. The front part of the print is 8 cm long and the back part is 7 cm long.',
            question: 'How long is the whole footprint?',
            answer: 15,
          },
          medium: {
            narrative: 'The whole footprint is 20 cm long. The toe part measures 5 cm.',
            question: 'How long is the heel part of the print?',
            answer: 15,
          },
          hard: {
            narrative: 'A print is 3 steps long, and each step makes it 5 cm longer.',
            question: '3 steps of 5 cm each — how long is the whole print?',
            answer: 15,
          },
        },
        unlocksProfile: [
          { suspectId: 'mila', field: 'footprint' },
          { suspectId: 'leo', field: 'footprint' },
          { suspectId: 'teddy', field: 'footprint' },
          { suspectId: 'riya', field: 'footprint' },
        ],
      },
      evidence: { id: 'ev-footprints', text: 'The print at the door is 15 cm long — measured with the ruler on your badge.', category: 'identity' },
    },
    {
      id: 'clock',
      cell: [9, 6], emoji: '⏰', name: 'Classroom clock',
      category: 'time',
      clueType: 'investigation',
      investigation: {
        hints: [
          'The long hand points to the 8. Each number on a clock is worth 5 minutes.',
          'Count by fives up to the 8: 5, 10, 15, 20, 25, 30, 35, 40. That is 8 × 5.',
        ],
        math: {
          easy: {
            narrative: 'The classroom clock was the only witness! The long hand points to the 8.',
            question: '8 × 5 = ? How many minutes does the long hand show?',
            answer: 40,
          },
          medium: {
            narrative: 'The clock stopped at 9:40 — the minute the cupcakes vanished. Snack time is at 10:00, exactly 20 minutes later.',
            question: '60 − 20 = ? How many minutes after 9:00 did the cupcakes vanish?',
            answer: 40,
          },
          hard: {
            narrative: 'The clock is frozen at 9:40. That is two lots of 20 minutes after 9:00.',
            question: '2 × 20 = ? How many minutes past 9:00 is it?',
            answer: 40,
          },
        },
        unlocksProfile: [
          { suspectId: 'leo', field: 'timing' },
          { suspectId: 'teddy', field: 'timing' },
          { suspectId: 'riya', field: 'timing' },
        ],
      },
      evidence: { id: 'ev-clock', text: 'The classroom clock stopped at 9:40 — the exact minute the cupcakes vanished.', category: 'time' },
    },
    {
      id: 'muddy',
      cell: [4, 8], emoji: '🐾', name: 'Muddy trail',
      category: 'location',
      clueType: 'investigation',
      investigation: {
        hints: [
          'Only the fresh WET prints tell the story. The old dry ones are from before the rain.',
          'The fresh prints are two rows of six. What is 2 × 6?',
        ],
        math: {
          easy: {
            narrative: 'A trail of prints crosses the kitchen. Some are old and dry, but the fresh wet ones near the sink are the clue.',
            question: '5 + 7 = ? How many fresh wet prints are there?',
            answer: 12,
          },
          medium: {
            narrative: 'The trail had 18 prints in total, but 6 of them are old and dry — from before the rain.',
            question: '18 − 6 = ? How many prints are fresh and wet?',
            answer: 12,
          },
          hard: {
            narrative: 'The fresh prints make two neat rows, with 6 prints in each row.',
            question: '2 rows of 6 — how many fresh wet prints is that?',
            answer: 12,
          },
        },
        unlocksProfile: [
          { suspectId: 'teddy', field: 'colour' },
          { suspectId: 'mila', field: 'colour' },
          { suspectId: 'leo', field: 'colour' },
        ],
      },
      evidence: { id: 'ev-muddy', text: 'The fresh wet trail has 12 prints. Teddy\'s old prints are dry — from before the rain.', category: 'location' },
    },
    {
      id: 'milk',
      cell: [11, 2], emoji: '🥛', name: 'Spilled milk jug',
      category: 'motive',
      clueType: 'investigation',
      investigation: {
        hints: [
          'Look at the little marks on the jug — the baker marked off each cup they poured.',
          'Five baking trays, five cups of milk in each. What is 5 × 5?',
        ],
        math: {
          easy: {
            narrative: 'A milk jug rests near the kitchen sink, with marks showing every cup poured out.',
            question: '15 + 10 = ? How many cups of milk were measured?',
            answer: 25,
          },
          medium: {
            narrative: 'The jug held 30 cups of milk. A little spilled, and 25 cups were used.',
            question: '30 − 5 = ? How many cups of milk were measured out?',
            answer: 25,
          },
          hard: {
            narrative: 'The baker measured milk for five trays, with five cups of milk in each.',
            question: '5 × 5 = ? How many cups of milk were measured?',
            answer: 25,
          },
        },
        unlocksProfile: [],
      },
      evidence: { id: 'ev-milk', text: 'Someone measured 25 cups of milk — enough for a whole batch of secret baking.', category: 'motive' },
    },
    {
      id: 'icecream',
      cell: [5, 4], emoji: '🍦', name: 'Ice cream cart',
      category: 'motive',
      clueType: 'observation',
      observation: {
        text: 'The ice cream cart is still full — only vanilla is left. Someone took the last chocolate scoop. Who is the biggest chocolate lover in class?',
        unlocksProfile: [{ suspectId: 'leo', field: 'favouriteFood' }],
      },
      evidence: { id: 'ev-icecream', text: 'Only vanilla left at the cart — someone took the last chocolate scoop.', category: 'motive' },
    },
    {
      id: 'feather',
      cell: [7, 9], emoji: '🪶', name: 'Blue feather',
      category: 'identity',
      clueType: 'observation',
      observation: {
        text: 'A single blue feather rests on the kitchen windowsill — the same shade as the feather in Riya\'s hair. She wears it over her fluffy white fur.',
        unlocksProfile: [{ suspectId: 'riya', field: 'colour' }],
      },
      evidence: { id: 'ev-feather', text: 'A blue feather, the same shade as the one in Riya\'s hair.', category: 'identity' },
    },
    {
      id: 'chalkboard',
      cell: [0, 10], emoji: '📝', name: 'Chalkboard note',
      category: 'location',
      clueType: 'observation',
      observation: {
        text: 'The chalkboard timetable shows gym drills at 9:40 with Leo — and a neat tick beside "Mila arrived on time" in careful handwriting.',
        unlocksProfile: [{ suspectId: 'mila', field: 'timing' }],
      },
      evidence: { id: 'ev-chalkboard', text: 'Timetable: gym at 9:40 with Leo. A tick shows Mila arrived on time.', category: 'location' },
    },
  ],

  eliminationRules: [
    { evidenceId: 'ev-footprints', eliminates: ['mila'] },
    { evidenceId: 'ev-clock', eliminates: ['leo'] },
    { evidenceId: 'ev-muddy', eliminates: ['teddy'] },
  ],

  currentThoughts: [
    {
      kind: 'prompt',
      evidenceId: 'ev-footprints',
      afterEvidenceIds: ['ev-footprints'],
      evidenceEmoji: '👣',
      evidenceShort: 'Footprint — 15 cm',
      question: 'Which suspect\'s footprint is too tiny?',
      compare: [
        { suspectId: 'leo', value: '16 cm' },
        { suspectId: 'mila', value: '4 cm' },
        { suspectId: 'teddy', value: '18 cm' },
        { suspectId: 'riya', value: '9 cm' },
      ],
      hint1: 'The print is 15 cm. Whose paws can\'t even reach that?',
      hint2: 'Who has the smallest paws in class?',
    },
    {
      kind: 'prompt',
      evidenceId: 'ev-clock',
      afterEvidenceIds: ['ev-clock'],
      evidenceEmoji: '⏰',
      evidenceShort: 'Clock — stopped at 9:40',
      question: 'Who couldn\'t be in the kitchen at 9:40?',
      compare: [
        { suspectId: 'leo', value: 'gym at 9:40' },
        { suspectId: 'mila', value: 'on time' },
        { suspectId: 'teddy', value: 'late (after the rain)' },
        { suspectId: 'riya', value: 'early, always' },
      ],
      hint1: 'The cupcakes vanished at exactly 9:40. Who was somewhere else then?',
      hint2: 'Who was leading gym drills in front of the whole class?',
    },
    {
      kind: 'prompt',
      evidenceId: 'ev-muddy',
      afterEvidenceIds: ['ev-muddy'],
      evidenceEmoji: '🐾',
      evidenceShort: 'Kitchen trail — 12 fresh wet prints',
      question: 'Whose prints were old and dry — before the rain?',
      compare: [
        { suspectId: 'teddy', value: 'old · dry' },
        { suspectId: 'leo', value: 'fresh · wet' },
        { suspectId: 'mila', value: 'fresh · wet' },
        { suspectId: 'riya', value: 'fresh · wet' },
      ],
      hint1: 'The kitchen trail is fresh and wet. Whose prints were made before the rain?',
      hint2: 'Who was the one classmate that left mud everywhere earlier?',
    },
    { kind: 'note', afterEvidenceIds: ['ev-milk'], emoji: '🥛', text: '25 cups of milk — a whole batch of secret baking.' },
    { kind: 'note', afterEvidenceIds: ['ev-icecream'], emoji: '🍦', text: 'Only vanilla left — someone took the last chocolate scoop.' },
    { kind: 'note', afterEvidenceIds: ['ev-feather'], emoji: '🪶', text: 'A blue feather — the same shade as the one in Riya\'s hair.' },
    { kind: 'note', afterEvidenceIds: ['ev-chalkboard'], emoji: '📝', text: 'Gym at 9:40 with Leo. A tick shows Mila arrived on time.' },
    {
      kind: 'aha',
      afterEvidenceIds: ['ev-footprints', 'ev-clock', 'ev-muddy'],
      afterEliminated: true,
      emoji: '🧠',
      text: 'Mila, Leo and Teddy all have alibis — only Riya is left!',
      nudge: 'Open Suspects and accuse Riya!',
    },
  ],

  confession: {
    culpritNarrative:
      'Riya\'s ears droop. "I hid the cupcakes to decorate them as a surprise for the teacher. I just... forgot to ask first." She hands you a folded note. "Mr. B asked me to give you this."',
    mrBNote: 'Excellent observation, Detective.\nEvery mystery begins with listening.',
    resolution:
      "The teacher hugs Riya warmly. \"Decorated cupcakes are my favourite kind of surprise,\" she says. The whole class pitches in, and by snack time the cupcakes are decorated, shared and delicious.",
    confessionLines: [
      '"I hid the cupcakes to decorate them for the teacher."',
      '"I just forgot to ask first — I\'m sorry I worried everyone."',
    ],
    giveLine: 'Riya hands you a folded note…',
    teacherLine: '"Decorated cupcakes are my favourite kind of surprise."',
    rewardSubtitle: '🧁 The cupcakes are decorated — and safe!',
  },
};

// ─── Case 2 — The Missing School Trophy ──────────────────────────────
// Greenleaf Animal School, Talent Day. The Golden Acorn Trophy vanished
// from the stage podium just before the show. Warm, playful, no villainy.

export const BOARD_CASE_2 = {
  type: 'board',
  id: 'board-2',
  caseNumber: 2,
  title: 'The Missing School Trophy',
  description: 'The Golden Acorn Trophy vanished before Talent Day! Walk the school, Detective — find the clues and crack the case!',
  difficulty: 1,
  xpReward: 60,
  topic: 'adventure',
  skillFamily: 'addsub',
  ageRange: [6, 9],
  gridSize: 12,
  blocked: [
    [1, 1], [2, 1], [1, 2],       // storage closet
    [10, 10], [11, 10], [10, 11],  // stage steps
    [8, 8], [9, 8], [8, 9],        // desk cluster
  ],
  playerStart: [6, 6],
  briefing:
    'The Golden Acorn Trophy has vanished from the stage! Walk the school, Detective — step on anything interesting and find the thief!',

  suspects: [
    {
      id: 'nora', name: 'Nora', animalEmoji: '🦊', species: 'fox',
      hint: 'Clever, eager to help, organized Talent Day.',
      profile: { favouriteFood: 'grapes', footprint: '14 cm', colour: 'rusty orange', timing: 'set up stage at 2:30' },
      eliminatedReason: "The rope size matches her footprint, but she was painting on the far side of the room when the trophy disappeared.",
    },
    {
      id: 'ethan', name: 'Ethan', animalEmoji: '🐘', species: 'elephant',
      hint: 'Big, clumsy, forgetful, gentle.',
      profile: { favouriteFood: 'peanut butter', footprint: '32 cm', colour: 'grey', timing: 'arrived late at 3:15' },
      eliminatedReason: "He arrived at 3:15 — the trophy was already gone by then.",
    },
    {
      id: 'mira', name: 'Mira', animalEmoji: '🐱', species: 'cat',
      hint: 'Quiet, artistic, shy.',
      profile: { favouriteFood: 'yarn string cheese', footprint: '11 cm', colour: 'calico patches', timing: 'painting backdrop 2:00–3:00' },
      eliminatedReason: "The acorn crafts point to the acorn-lover, not the painter.",
    },
    {
      id: 'suki', name: 'Suki', animalEmoji: '🐿️', species: 'squirrel',
      hint: 'Small, energetic, always rushing.',
      profile: { favouriteFood: 'acorns', footprint: '6 cm', colour: 'brown', timing: 'running errands all afternoon' },
      eliminatedReason: "She took the trophy to polish it and put a ribbon on it as a surprise.",
    },
  ],
  culprit: 'suki',

  objects: [
    {
      id: 'backpack', cell: [3, 4], emoji: '🎒', name: "Suki's backpack",
      category: 'motive',
      clueType: 'investigation',
      investigation: {
        hints: [
          'Count all the acorn crafts in the backpack.',
          'There are two groups: 3 in one pocket and 2 in another. 3 + 2 = ?',
        ],
        math: {
          easy: {
            narrative: "Suki's backpack is open. You see two groups of acorn crafts inside.",
            question: '🌰🌰🌰 + 🌰🌰 = How many acorn crafts?',
            answer: 5,
            visuals: {
              type: 'count-visual',
              groups: [3, 2],
              emoji: '🌰',
            },
          },
          medium: {
            narrative: "Suki's backpack is open. Acorn crafts are scattered inside.",
            question: 'How many acorn crafts are in the backpack?',
            answer: 5,
            visuals: {
              type: 'count-visual',
              groups: [5],
              emoji: '🌰',
            },
          },
          hard: {
            narrative: 'Suki had 8 acorn crafts. 3 fell out on the stage when she was running.',
            question: 'How many acorn crafts are still in the backpack?',
            answer: 5,
            visuals: {
              type: 'count-visual',
              groups: [8],
              emoji: '🌰',
              subtractFrom: 3,
            },
          },
        },
        unlocksProfile: [
          { suspectId: 'suki', field: 'favouriteFood' },
          { suspectId: 'mira', field: 'favouriteFood' },
        ],
      },
      evidence: { id: 'ev-backpack', text: '5 acorn crafts in the backpack — Suki was collecting acorn supplies.', category: 'motive' },
    },
    {
      id: 'clock', cell: [9, 3], emoji: '🕒', name: 'Stage clock',
      category: 'time',
      clueType: 'investigation',
      investigation: {
        hints: [
          'Look at the hour hand. Where is it pointing?',
          'The hour hand points to 3. What time is that?',
        ],
        math: {
          easy: {
            narrative: 'The stage clock shows when the trophy was last seen. Only the hour hand is clearly visible.',
            question: 'What time does the hour hand show?',
            answer: 3,
            visuals: {
              type: 'clock',
              hour: 3,
              minute: 0,
              showMinute: false,
            },
          },
          medium: {
            narrative: 'The stage clock shows when the trophy was last seen. Both hands are visible.',
            question: 'What time is it?',
            answer: 3,
            visuals: {
              type: 'clock',
              hour: 3,
              minute: 0,
            },
          },
          hard: {
            narrative: 'The Talent Day schedule says the show starts when the hour hand is on 3 and the minute hand is on 12.',
            question: 'What time does the show start?',
            answer: 3,
            visuals: {
              type: 'clock',
              hour: 3,
              minute: 0,
              description: true,
            },
          },
        },
        unlocksProfile: [
          { suspectId: 'nora', field: 'timing' },
          { suspectId: 'ethan', field: 'timing' },
          { suspectId: 'mira', field: 'timing' },
          { suspectId: 'suki', field: 'timing' },
        ],
      },
      evidence: { id: 'ev-timing', text: 'The trophy was last seen at 3:00 — it vanished between 2:30 and 3:00.', category: 'time' },
    },
    {
      id: 'rope', cell: [5, 7], emoji: '🪢', name: 'Rope on the podium',
      category: 'identity',
      clueType: 'investigation',
      investigation: {
        hints: [
          'Look at the ruler markings. Count the centimetres.',
          'The rope starts at 2 cm and ends at 16 cm. 16 − 2 = ?',
        ],
        math: {
          easy: {
            narrative: 'A rope mark on the podium. Here is a ruler to measure it. Every centimetre is labeled.',
            question: 'How long is the rope? (ruler shows every cm)',
            answer: 14,
            visuals: {
              type: 'measure',
              lengthCm: 14,
              rulerLabels: 'all',
            },
          },
          medium: {
            narrative: 'A rope mark on the podium. Here is a ruler — only the start and end are labeled.',
            question: 'How long is the rope? (count the tick marks)',
            answer: 14,
            visuals: {
              type: 'measure',
              lengthCm: 14,
              rulerLabels: 'ends',
            },
          },
          hard: {
            narrative: 'A rope mark on the podium. The rope starts at the 2 cm mark and ends at the 16 cm mark.',
            question: 'The rope goes from 2 cm to 16 cm. How long is it?',
            answer: 14,
            visuals: {
              type: 'measure',
              lengthCm: 14,
              rulerStart: 2,
              rulerEnd: 16,
            },
          },
        },
        unlocksProfile: [
          { suspectId: 'nora', field: 'footprint' },
          { suspectId: 'ethan', field: 'footprint' },
          { suspectId: 'mira', field: 'footprint' },
          { suspectId: 'suki', field: 'footprint' },
        ],
      },
      evidence: { id: 'ev-rope', text: 'The rope is 14 cm long — it matches someone\'s footprint size.', category: 'identity' },
    },
    {
      id: 'button', cell: [7, 2], emoji: '🔵', name: 'Small blue button',
      category: 'identity',
      clueType: 'observation',
      observation: {
        text: 'A small blue button near the trophy stand. "I\'ve seen this before..."',
        unlocksProfile: [],
      },
      evidence: { id: 'ev-button', text: 'A small blue button — seen before at another crime scene.', category: 'identity' },
    },
    {
      id: 'paint', cell: [6, 5], emoji: '🖌️', name: 'Paint smudge on podium',
      category: 'identity',
      clueType: 'observation',
      observation: {
        text: 'Calico-coloured paint on the podium edge. Mira was painting the backdrop nearby.',
        unlocksProfile: [
          { suspectId: 'mira', field: 'colour' },
        ],
      },
      evidence: { id: 'ev-paint', text: 'Calico paint smudge on the podium — Mira was nearby.', category: 'identity' },
    },
    {
      id: 'wrapper', cell: [4, 6], emoji: '🍬', name: 'Wrapper near trophy stand',
      category: 'location',
      clueType: 'observation',
      observation: {
        text: 'A peanut butter wrapper on the floor near the trophy stand. Ethan was snacking nearby.',
        unlocksProfile: [
          { suspectId: 'nora', field: 'favouriteFood' },
          { suspectId: 'ethan', field: 'favouriteFood' },
          { suspectId: 'mira', field: 'favouriteFood' },
        ],
      },
      evidence: { id: 'ev-wrapper', text: 'Peanut butter wrapper near the trophy stand — Ethan was snacking.', category: 'location' },
    },
    {
      id: 'schedule', cell: [8, 5], emoji: '📋', name: 'Talent Day schedule',
      category: 'time',
      clueType: 'observation',
      observation: {
        text: 'The Talent Day schedule shows: "Stage set-up: 2:30 | Backdrop painting: 2:00–3:00 | Show starts: 3:00 | Ethan arrives: 3:15"',
        unlocksProfile: [
          { suspectId: 'nora', field: 'timing' },
          { suspectId: 'ethan', field: 'timing' },
          { suspectId: 'mira', field: 'timing' },
          { suspectId: 'suki', field: 'timing' },
        ],
      },
      evidence: { id: 'ev-schedule', text: 'The Talent Day schedule shows who was where and when.', category: 'time' },
    },
  ],

  eliminationRules: [
    { evidenceId: 'ev-timing', eliminates: ['ethan'] },
    { evidenceId: 'ev-rope', eliminates: ['nora'] },
    { evidenceId: 'ev-backpack', eliminates: ['mira'] },
    { evidenceId: 'ev-wrapper', eliminates: ['nora', 'mira'] },
    { evidenceId: 'ev-schedule', eliminates: ['nora'] },
  ],

  currentThoughts: [
    {
      kind: 'note',
      afterEvidenceIds: ['ev-timing'],
      emoji: '🕐',
      text: 'The trophy was last seen at 3:00. It disappeared between 2:30 and 3:00.',
    },
    {
      kind: 'prompt',
      evidenceId: 'ev-timing',
      afterEvidenceIds: ['ev-timing'],
      evidenceEmoji: '🕐',
      evidenceShort: 'Clock — 2:30 to 3:00',
      question: 'Who was NOT near the stage when the trophy disappeared?',
      compare: [
        { suspectId: 'nora', value: '2:30 — set up stage' },
        { suspectId: 'ethan', value: '3:15 — arrived late' },
        { suspectId: 'mira', value: '2:00–3:00 — painting' },
        { suspectId: 'suki', value: 'afternoon — running errands' },
      ],
      hint1: 'Look at the schedule. Who arrived AFTER 3:00?',
      hint2: 'Ethan came at 3:15 — the trophy was already gone.',
    },
    {
      kind: 'note',
      afterEvidenceIds: ['ev-timing', 'ev-rope'],
      emoji: '🪢',
      text: "The rope is 14 cm. That matches someone's footprint size...",
    },
    {
      kind: 'prompt',
      evidenceId: 'ev-rope',
      afterEvidenceIds: ['ev-timing', 'ev-rope'],
      evidenceEmoji: '🪢',
      evidenceShort: 'Rope — 14 cm',
      question: "The rope is 14 cm. Whose footprint matches — and does that make them guilty?",
      compare: [
        { suspectId: 'nora', value: '14 cm' },
        { suspectId: 'ethan', value: '32 cm' },
        { suspectId: 'mira', value: '11 cm' },
        { suspectId: 'suki', value: '6 cm' },
      ],
      hint1: "Nora's footprint is 14 cm — but was she near the trophy?",
      hint2: 'Nora was painting on the far side. The rope size matches her, but she has an alibi.',
    },
    {
      kind: 'note',
      afterEvidenceIds: ['ev-timing', 'ev-rope', 'ev-backpack'],
      emoji: '🎒',
      text: 'Five acorn crafts in the backpack... who collects acorns?',
    },
    {
      kind: 'prompt',
      evidenceId: 'ev-backpack',
      afterEvidenceIds: ['ev-timing', 'ev-rope', 'ev-backpack'],
      evidenceEmoji: '🎒',
      evidenceShort: 'Backpack — acorn crafts',
      question: '5 acorn crafts in the backpack. Who would have these?',
      compare: [
        { suspectId: 'nora', value: 'grapes' },
        { suspectId: 'ethan', value: 'peanut butter' },
        { suspectId: 'mira', value: 'yarn string cheese' },
        { suspectId: 'suki', value: 'acorns' },
      ],
      hint1: "Think about each suspect's favourite food.",
      hint2: 'Suki loves acorns — she was collecting them for her act.',
    },
    {
      kind: 'aha',
      afterEvidenceIds: ['ev-timing', 'ev-rope', 'ev-backpack'],
      afterEliminated: true,
      emoji: '🏆',
      text: 'Only one suspect remains — the one who loves acorns, was running errands, and had a backpack full of acorn crafts.',
      nudge: 'Open Suspects and accuse Suki!',
    },
    { kind: 'note', afterEvidenceIds: ['ev-button'], emoji: '🔵', text: 'A small blue button — seen before at another crime scene.' },
    { kind: 'note', afterEvidenceIds: ['ev-paint'], emoji: '🖌️', text: 'Calico paint smudge on the podium — Mira was painting nearby.' },
    {
      kind: 'note',
      afterEvidenceIds: ['ev-wrapper'],
      emoji: '🍬',
      text: 'A peanut butter wrapper near the trophy stand — Ethan was snacking.',
    },
    {
      kind: 'prompt',
      evidenceId: 'ev-wrapper',
      afterEvidenceIds: ['ev-wrapper'],
      evidenceEmoji: '🍬',
      evidenceShort: 'Wrapper — peanut butter',
      question: 'A peanut butter wrapper near the trophy. Who was snacking there?',
      compare: [
        { suspectId: 'nora', value: 'grapes' },
        { suspectId: 'ethan', value: 'peanut butter' },
        { suspectId: 'mira', value: 'yarn string cheese' },
        { suspectId: 'suki', value: 'acorns' },
      ],
      hint1: "Look at each suspect's favourite food.",
      hint2: 'Peanut butter is Ethan\'s favourite — but was he near the trophy?',
    },
    {
      kind: 'note',
      afterEvidenceIds: ['ev-schedule'],
      emoji: '📋',
      text: 'The Talent Day schedule shows who was where and when.',
    },
    {
      kind: 'prompt',
      evidenceId: 'ev-schedule',
      afterEvidenceIds: ['ev-schedule'],
      evidenceEmoji: '📋',
      evidenceShort: 'Schedule — timeline',
      question: 'The schedule shows who was near the stage. Who left before the show?',
      compare: [
        { suspectId: 'nora', value: '2:30 — set up stage' },
        { suspectId: 'ethan', value: '3:15 — arrived late' },
        { suspectId: 'mira', value: '2:00–3:00 — painting' },
        { suspectId: 'suki', value: 'afternoon — running errands' },
      ],
      hint1: 'Who set up the stage at 2:30 and then left?',
      hint2: 'Nora set up at 2:30 — the trophy disappeared between 2:30 and 3:00.',
    },
  ],

  confession: {
    culpritNarrative:
      "Suki's ears droop. \"I just wanted to polish the trophy and put a ribbon on it for the winner. I didn't mean to make everyone worry!\" She hands you a folded note. \"Mr. B left this for you.\"",
    mrBNote: 'You noticed what others missed.\nBut some clues are meant to be heard.\nKeep listening.',
    resolution:
      'The teacher smiles. "A polished trophy is a kind gift, Suki — but next time, tell someone first." Suki nods. The Talent Day show goes on, and the Golden Acorn Trophy gleams on its stand.',
    confessionLines: [
      '"I only wanted to make the trophy special."',
      '"I\'m sorry I worried everyone."',
    ],
    giveLine: 'Suki hands you a folded note…',
    teacherLine: '"The trophy is safe. Let\'s enjoy Talent Day!"',
    rewardSubtitle: '🏆 The Golden Acorn is safe!',
  },
};

// ── Case 3: The Mystery Behind Mr. B ─────────────────────────────
export const BOARD_CASE_3 = {
  type: 'board',
  id: 'board-3',
  caseNumber: 3,
  title: 'The Mystery Behind Mr. B',
  description: 'The school bell is missing — and three blue buttons have appeared across campus. Walk the school, Detective — this case connects everything!',
  difficulty: 1,
  xpReward: 75,
  topic: 'adventure',
  skillFamily: 'addsub',
  ageRange: [6, 9],
  gridSize: 12,
  blocked: [
    [1, 1], [2, 1], [1, 2],       // storage closet
    [10, 1], [11, 1], [10, 2],    // music room wall
    [9, 9], [10, 9], [9, 10],     // desk cluster
  ],
  playerStart: [6, 6],
  briefing:
    'The school bell has vanished from the music room! Blue buttons are appearing everywhere. Walk the school, Detective — step on anything interesting and find who took the bell!',

  suspects: [
    {
      id: 'pip', name: 'Pip', animalEmoji: '🐭', species: 'mouse',
      hint: 'Tiny, curious, always near the music room.',
      profile: { favouriteFood: 'sunflower seeds', footprint: '4 cm', colour: 'grey', timing: 'in the music room at 2:00' },
      eliminatedReason: "His paws are only 4 cm — the footprints near the bell stand are much bigger.",
    },
    {
      id: 'bruno', name: 'Bruno', animalEmoji: '🐻', species: 'bear',
      hint: 'Big, gentle, was carrying boxes.',
      profile: { favouriteFood: 'honey', footprint: '20 cm', colour: 'brown', timing: 'moving boxes 1:30–2:30' },
      eliminatedReason: "He was moving boxes in the hall — he never went near the music room.",
    },
    {
      id: 'cleo', name: 'Cleo', animalEmoji: '🐱', species: 'cat',
      hint: 'Sleek, quiet, likes high places.',
      profile: { favouriteFood: 'tuna', footprint: '10 cm', colour: 'black', timing: 'on the shelf at 2:15' },
      eliminatedReason: "She was on the shelf when the bell vanished — she couldn't have taken it.",
    },
    {
      id: 'digby', name: 'Digby', animalEmoji: '🐶', species: 'dog',
      hint: 'Friendly, noisy, was playing outside.',
      profile: { favouriteFood: 'biscuits', footprint: '16 cm', colour: 'golden', timing: 'outside 1:45–2:30' },
      eliminatedReason: "He was outside the whole time — the bell was taken from inside the music room.",
    },
  ],
  culprit: null,

  objects: [
    {
      id: 'bell-stand', cell: [3, 4], emoji: '🔔', name: 'Empty bell stand',
      category: 'identity',
      clueType: 'observation',
      observation: {
        text: 'The bell stand is empty. A small blue button lies beside it. You\'ve seen this before...',
        unlocksProfile: [],
      },
      evidence: { id: 'ev-bluebutton', text: 'A blue button on the empty bell stand — the third one you\'ve found.', category: 'identity' },
    },
    {
      id: 'footprints', cell: [5, 7], emoji: '👣', name: 'Footprints by the stand',
      category: 'identity',
      clueType: 'investigation',
      investigation: {
        hints: [
          'Look at the ruler. How long are the footprints?',
          'The prints go from 0 to 16 cm.',
        ],
        math: {
          easy: {
            narrative: 'Clear footprints near the bell stand. Every centimetre is labeled on the ruler.',
            question: 'How long are the footprints? (ruler shows every cm)',
            answer: 16,
            visuals: {
              type: 'measure',
              lengthCm: 16,
              rulerLabels: 'all',
            },
          },
          medium: {
            narrative: 'Footprints near the bell stand. The ruler only shows the start and end.',
            question: 'How long are the footprints? (count the tick marks)',
            answer: 16,
            visuals: {
              type: 'measure',
              lengthCm: 16,
              rulerLabels: 'ends',
            },
          },
          hard: {
            narrative: 'Footprints near the bell stand. The ruler starts at 0 and ends at 16 cm.',
            question: 'The prints go from 0 to 16 cm. How long are they?',
            answer: 16,
            visuals: {
              type: 'measure',
              lengthCm: 16,
              rulerStart: 0,
              rulerEnd: 16,
            },
          },
        },
        unlocksProfile: [
          { suspectId: 'pip', field: 'footprint' },
          { suspectId: 'bruno', field: 'footprint' },
          { suspectId: 'cleo', field: 'footprint' },
          { suspectId: 'digby', field: 'footprint' },
        ],
      },
      evidence: { id: 'ev-footprints', text: 'The footprints are 16 cm — too big for Pip.', category: 'identity' },
    },
    {
      id: 'clock', cell: [9, 3], emoji: '🕒', name: 'Activity room clock',
      category: 'time',
      clueType: 'investigation',
      investigation: {
        hints: [
          'Look at the hour hand. Where is it pointing?',
          'The hour hand points to 2. What time is that?',
        ],
        math: {
          easy: {
            narrative: 'The activity room clock shows when the bell vanished. Only the hour hand is visible.',
            question: 'What time does the hour hand show?',
            answer: 2,
            visuals: {
              type: 'clock',
              hour: 2,
              minute: 0,
              showMinute: false,
            },
          },
          medium: {
            narrative: 'The activity room clock shows when the bell vanished. Both hands are visible.',
            question: 'What time is it?',
            answer: 2,
            visuals: {
              type: 'clock',
              hour: 2,
              minute: 0,
            },
          },
          hard: {
            narrative: 'The schedule says the bell was taken when the hour hand was on 2 and the minute hand was on 12.',
            question: 'What time was the bell taken?',
            answer: 2,
            visuals: {
              type: 'clock',
              hour: 2,
              minute: 0,
              description: true,
            },
          },
        },
        unlocksProfile: [
          { suspectId: 'pip', field: 'timing' },
          { suspectId: 'bruno', field: 'timing' },
          { suspectId: 'cleo', field: 'timing' },
          { suspectId: 'digby', field: 'timing' },
        ],
      },
      evidence: { id: 'ev-clock', text: 'The bell vanished at 2:00 — Digby was outside from 1:45.', category: 'time' },
    },
    {
      id: 'boxes', cell: [4, 5], emoji: '📦', name: 'Music room boxes',
      category: 'motive',
      clueType: 'investigation',
      investigation: {
        hints: [
          'Count all the boxes in the music room.',
          'There are 6 boxes stacked near the wall.',
        ],
        math: {
          easy: {
            narrative: 'Boxes are stacked in the music room. Two groups of boxes are visible.',
            question: '📦📦📦 + 📦📦📦 = How many boxes in the music room?',
            answer: 6,
            visuals: {
              type: 'count-visual',
              groups: [3, 3],
              emoji: '📦',
            },
          },
          medium: {
            narrative: 'Boxes are stacked in the music room. Count them all.',
            question: 'How many boxes are in the music room?',
            answer: 6,
            visuals: {
              type: 'count-visual',
              groups: [6],
              emoji: '📦',
            },
          },
          hard: {
            narrative: 'There were 8 boxes in the music room. Bruno moved 2 to the hall.',
            question: 'How many boxes are still in the music room?',
            answer: 6,
            visuals: {
              type: 'count-visual',
              groups: [8],
              emoji: '📦',
              subtractFrom: 2,
            },
          },
        },
        unlocksProfile: [
          { suspectId: 'bruno', field: 'timing' },
        ],
      },
      evidence: { id: 'ev-boxes', text: '6 boxes in the music room — Bruno was moving boxes in the hall, not here.', category: 'motive' },
    },
    {
      id: 'cloth', cell: [7, 2], emoji: '🧵', name: 'Blue cloth scrap',
      category: 'identity',
      clueType: 'observation',
      observation: {
        text: 'A scrap of blue cloth near the bell stand. The same colour as the button. Someone was here.',
        unlocksProfile: [],
      },
      evidence: { id: 'ev-bluecloth', text: 'Blue cloth matching the button — someone was here.', category: 'identity' },
    },
    {
      id: 'door', cell: [6, 5], emoji: '🎵', name: 'Music room door',
      category: 'location',
      clueType: 'observation',
      observation: {
        text: 'Scratches near the lock on the music room door. The bell was taken from inside.',
        unlocksProfile: [],
      },
      evidence: { id: 'ev-door', text: 'Scratches on the music room door — the bell was taken from inside.', category: 'location' },
    },
    {
      id: 'note', cell: [8, 5], emoji: '📜', name: 'Final note',
      category: 'motive',
      clueType: 'observation',
      observation: {
        text: 'A sealed note on the music room desk. "You listened. You noticed. You solved."',
        unlocksProfile: [],
      },
      evidence: { id: 'ev-note', text: 'A sealed note: "You listened. You noticed. You solved."', category: 'motive' },
    },
  ],

  eliminationRules: [
    { evidenceId: 'ev-footprints', eliminates: ['pip'] },
    { evidenceId: 'ev-clock', eliminates: ['digby'] },
    { evidenceId: 'ev-boxes', eliminates: ['bruno'] },
  ],

  currentThoughts: [
    {
      kind: 'note',
      afterEvidenceIds: ['ev-bluebutton'],
      emoji: '🔵',
      text: 'A blue button on the bell stand — the third one you\'ve found. This is connected.',
    },
    {
      kind: 'note',
      afterEvidenceIds: ['ev-footprints'],
      emoji: '👣',
      text: 'The footprints are 16 cm. Someone big was here.',
    },
    {
      kind: 'prompt',
      evidenceId: 'ev-footprints',
      afterEvidenceIds: ['ev-footprints'],
      evidenceEmoji: '👣',
      evidenceShort: 'Footprints — 16 cm',
      question: 'The prints are 16 cm. Which suspect is too small to leave them?',
      compare: [
        { suspectId: 'pip', value: '4 cm' },
        { suspectId: 'bruno', value: '20 cm' },
        { suspectId: 'cleo', value: '10 cm' },
        { suspectId: 'digby', value: '16 cm' },
      ],
      hint1: 'The prints are 16 cm. Who has much smaller paws?',
      hint2: 'Pip is only 4 cm — his paws are way too small.',
    },
    {
      kind: 'note',
      afterEvidenceIds: ['ev-clock'],
      emoji: '🕒',
      text: 'The bell vanished at 2:00. Who was where?',
    },
    {
      kind: 'prompt',
      evidenceId: 'ev-clock',
      afterEvidenceIds: ['ev-clock'],
      evidenceEmoji: '🕒',
      evidenceShort: 'Clock — 2:00',
      question: 'The bell vanished at 2:00. Who was NOT in the school?',
      compare: [
        { suspectId: 'pip', value: '2:00 — music room' },
        { suspectId: 'bruno', value: '1:30–2:30 — moving boxes' },
        { suspectId: 'cleo', value: '2:15 — on the shelf' },
        { suspectId: 'digby', value: '1:45–2:30 — outside' },
      ],
      hint1: 'Who was outside when the bell vanished?',
      hint2: 'Digby was outside from 1:45 to 2:30 — he couldn\'t have taken the bell.',
    },
    {
      kind: 'note',
      afterEvidenceIds: ['ev-boxes'],
      emoji: '📦',
      text: '6 boxes in the music room. Bruno was moving boxes in the hall.',
    },
    {
      kind: 'prompt',
      evidenceId: 'ev-boxes',
      afterEvidenceIds: ['ev-boxes'],
      evidenceEmoji: '📦',
      evidenceShort: 'Boxes — music room',
      question: 'Bruno was moving boxes in the hall. Was he near the music room?',
      compare: [
        { suspectId: 'pip', value: 'music room at 2:00' },
        { suspectId: 'bruno', value: 'hall — moving boxes' },
        { suspectId: 'cleo', value: 'on the shelf at 2:15' },
        { suspectId: 'digby', value: 'outside 1:45–2:30' },
      ],
      hint1: 'Bruno was in the hall, not the music room.',
      hint2: 'Moving boxes in the hall means Bruno wasn\'t near the bell.',
    },
    {
      kind: 'note',
      afterEvidenceIds: ['ev-bluecloth'],
      emoji: '🧵',
      text: 'Blue cloth matches the button. Someone planned this.',
    },
    {
      kind: 'note',
      afterEvidenceIds: ['ev-door'],
      emoji: '🎵',
      text: 'Scratches on the music room door — the bell was taken from inside.',
    },
    {
      kind: 'note',
      afterEvidenceIds: ['ev-note'],
      emoji: '📜',
      text: '"You listened. You noticed. You solved." — someone wanted you to find this.',
    },
    {
      kind: 'aha',
      afterEvidenceIds: ['ev-footprints', 'ev-clock', 'ev-boxes'],
      emoji: '🧠',
      text: 'All four students have alibis — but the blue button keeps appearing. Someone else planned this.',
      nudge: 'Think about who has been leaving clues all along...',
    },
  ],

  deduction: {
    opening: [
      'Detective... wait!',
      'Something connects all three cases.',
    ],
    cards: [
      { id: 'listening', emoji: '📜', label: 'Case 1', text: '"Every mystery begins with listening."' },
      { id: 'heard', emoji: '📜', label: 'Case 2', text: '"Some clues are meant to be heard."' },
      { id: 'music', emoji: '🎵', label: 'Clue', text: 'Music is something we hear.' },
      { id: 'ears', emoji: '👂', label: 'Clue', text: 'Ears help us hear sounds.' },
      { id: 'blue', emoji: '🔵', label: 'Clue', text: 'The blue button appeared in every case.' },
    ],
    connections: [
      {
        from: 'listening',
        to: 'heard',
        prompt: 'Which two clues belong together?',
        praise: 'Listening and hearing — they connect!',
        hint: 'Look at what these clues have in common.',
        portraitRevealStage: 1,
      },
      {
        from: 'heard',
        to: 'music',
        prompt: 'What connects to the music?',
        praise: 'Yes! Music is something we hear.',
        hint: 'One clue is about something you can hear.',
        portraitRevealStage: 2,
      },
      {
        from: 'music',
        to: 'ears',
        prompt: 'What helps us hear the music?',
        praise: 'Yes! Ears help us hear!',
        hint: 'What body part helps you hear?',
        portraitRevealStage: 3,
      },
    ],
    blueButton: {
      cardId: 'blue',
      caseCards: ['listening', 'heard', 'music'],
      prompt: 'Where have you seen this before?',
      praise: 'The same button appeared in all three cases!',
      hint: 'Think back to the other mysteries.',
      caseSummaries: ['Case 1 🔵', 'Case 2 🔵', 'Case 3 🔵'],
    },
    npc: { id: 'mr-b', name: 'Mr. B', animalEmoji: '🐘', species: 'elephant' },
    portraitInteraction: { pointer: true, pulse: true, repeat: 2 },
    mrBNote: 'You listened.\nYou noticed.\nYou solved.\n\nEvery mystery begins with listening.',
    resolution:
      'Mr. B rings the restored bell. The whole school cheers. Mystery Day celebration begins — and you are the guest of honour.',
  },

  confession: {
    culpritNarrative:
      'Mr. B steps forward, his trunk raised with pride. "I created all three mysteries as a test — to find a true detective. The blue buttons, the sealed notes, the school bell — they were all part of the challenge."',
    mrBNote: 'You listened.\nYou noticed.\nYou solved.\n\nEvery mystery begins with listening.',
    resolution:
      'The teacher smiles. "A true detective listens, observes, and thinks. You did all three." Mr. B rings the restored bell. The whole school cheers. Mystery Day celebration begins — and you are the guest of honour.',
    confessionLines: [
      '"I created all three mysteries as a test."',
      '"You noticed, listened and solved them all."',
    ],
    giveLine: 'Mr. B gives you a folded note…',
    teacherLine: '"A true detective listens, observes, and thinks."',
    rewardSubtitle: '🔔 The mystery bell is restored!',
    culpritEmoji: '🐘',
  },
};

export const BOARD_CASES = [BOARD_CASE_1, BOARD_CASE_2, BOARD_CASE_3];

/** Returns the board case spec for an id, or null. */
export function getBoardCase(id) {
  return BOARD_CASES.find(c => c.id === id) || null;
}

/**
 * Validate a board case spec (thin alias over the engine validator).
 * Returns string[] of problems; an empty array means the spec is valid.
 */
export function validateBoardCase(spec) {
  return validateBoardSpec(spec);
}

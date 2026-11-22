/**
 * Escape 1: "The Locked Tiffin Box" (Easy — 3 Rooms, Classes 6-7 CBSE)
 * Topic: Basic Arithmetic (BODMAS with "of", nested brackets, negative integers)
 */

const tiffinBoxEscape = {
  id: 'tiffin-box',
  title: 'The Locked Tiffin Box',
  shortTitle: 'Tiffin Box',
  difficulty: 'easy',
  difficultyLabel: 'EASY',
  topic: 'Arithmetic & BODMAS',
  shortTopic: 'Arithmetic',
  focusConcept: 'Order of Operations',
  classLevel: 'Class 6-7',
  roomCount: 3,
  icon: '🍱',
  accentColor: '#4ade80',
  description:
    'Your friend locked your tiffin box! Solve BODMAS clues to get your lunch back before the recess bell rings.',
  completionHeadline: 'Tiffin Box Unlocked! Enjoy your lunch before recess ends!',
  completionMessage:
    "Your friend laughs and says, 'Well played—you beat every BODMAS trap!'",
  rooms: [
    {
      id: 'tiffin-room-1',
      roomNumber: 1,
      name: 'The Notebook Clue',
      shortName: 'Notebook Clue',
      emoji: '📓',
      scene: 'classroom',
      sectorLabel: 'Classroom • Row 2',
      clueCode: 'Clue #01-A',
      logHeader: 'SCRIBBLED NOTE • CLASS 7B',
      storyText:
        "You open your math notebook and find a sticky note from your friend: 'Your lunch is safe—just simplify this BODMAS expression first. Watch out for the word of!'",
      problemTemplate: {
        generator: 'arithmeticGenerator',
        subtype: 'of-mixed',
        config: {
          answerRange: [5, 50],
        },
      },
      hints: [
        "In BODMAS, 'of' has higher priority than × and ÷. Evaluate {{b}} of {{c}} first.",
        'Step 1: {{b}} of {{c}} = {{b_of_c}}, and {{d}} × {{e}} = {{d_times_e}}. Now simplify {{a}} + {{b_of_c}} − {{d_times_e}}.',
        'Full solution: {{a}} + {{b_of_c}} − {{d_times_e}} = {{answer}}.',
      ],
    },
    {
      id: 'tiffin-room-2',
      roomNumber: 2,
      name: 'The Corridor Riddle',
      shortName: 'Corridor Riddle',
      emoji: '🚶',
      scene: 'corridor',
      sectorLabel: 'Corridor • Locker 14',
      clueCode: 'Clue #02-B',
      logHeader: 'LOCKER NOTE • MAIN CORRIDOR',
      storyText:
        "A folded chit is taped inside your corridor locker: 'Nice job on the first clue! Now peel these nested brackets from the inside out to unlock the canteen gate.'",
      problemTemplate: {
        generator: 'arithmeticGenerator',
        subtype: 'four-level-brackets',
        config: {
          answerRange: [10, 50],
        },
      },
      hints: [
        'Start from the innermost bracket and move outward: solve () first, then {}, then [].',
        'Inner result: ({{d}} − {{e}}) = {{inner}}. Curly braces: {{{c}} + {{inner}}} = {{mid}}.',
        'Square brackets: [{{b}} − {{mid}}] = {{outer}}. Final subtraction: {{a}} − {{outer}} = {{answer}}.',
      ],
    },
    {
      id: 'tiffin-room-3',
      roomNumber: 3,
      name: 'The Canteen Lock',
      shortName: 'Canteen Lock',
      emoji: '🍱',
      scene: 'canteen',
      sectorLabel: 'Canteen • Table 3',
      clueCode: 'Clue #03-C',
      logHeader: 'FINAL CLUE • SCHOOL CANTEEN',
      storyText:
        'The tiffin box is right here on the canteen counter! One last lock code—watch out for the negative signs!',
      problemTemplate: {
        generator: 'arithmeticGenerator',
        subtype: 'negative-integers',
        config: {
          answerRange: [-30, 30],
        },
      },
      hints: [
        'Sign rules: (−) ÷ (−) = (+). Do division and multiplication before adding ({{neg_a}}).',
        'Step 1: ({{neg_b}}) ÷ ({{neg_c}}) = +{{div_result}}. Step 2: {{div_result}} × {{d}} = {{mul_result}}.',
        'Full solution: ({{neg_a}}) + {{mul_result}} = {{answer}}.',
      ],
    },
  ],
};

export default tiffinBoxEscape;
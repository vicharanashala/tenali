/**
 * Escape 2: "The Science Fair Secret" (Medium — 5 Rooms, Classes 8-9 CBSE HOTS)
 * Topic: Linear Equations (single variable + CBSE word problems)
 */

const scienceFairEscape = {
  id: 'science-fair',
  title: 'The Science Fair Secret',
  shortTitle: 'Science Fair',
  difficulty: 'medium',
  difficultyLabel: 'MEDIUM',
  topic: 'Linear Equations',
  shortTopic: 'Equations',
  focusConcept: 'Linear Variables (2x + 7 = 19)',
  classLevel: 'Class 8-9',
  roomCount: 5,
  icon: '🧪',
  accentColor: '#fbbf24',
  description:
    'Crack equation clues left by seniors to unlock the chemistry lab for your science fair demonstration before judges arrive.',
  completionHeadline: 'Excellent work! You cracked the science wing like a pro!',
  completionMessage:
    'You retrieved the rare reagent just in time for the science fair judges!',
  rooms: [
    {
      id: 'science-room-1',
      roomNumber: 1,
      name: 'Science Wing Entrance',
      shortName: 'Science Wing',
      emoji: '🚪',
      scene: 'entrance',
      sectorLabel: 'Science Block • Ground Floor',
      clueCode: 'Clue #01-A',
      logHeader: 'ARCHIVED LOG • SCIENCE WING',
      storyText:
        'The main keypad to the Science Wing is locked. Senior lab captains taped an equation beside the biometric scanner—solve for x to open the corridor doors.',
      problemTemplate: {
        generator: 'linearEqGenerator',
        subtype: 'brackets-both-sides',
      },
      hints: [
        'Expand the bracket on the left side first by multiplying {{a}} into both x and {{b}}.',
        'Expanded form: {{a}}x + {{ab}} = {{c}}x + {{d}}. Group x terms on the left: {{diff_coeff}}x = {{rhs_diff}}.',
        'Divide both sides by {{diff_coeff}}: x = {{rhs_diff}} ÷ {{diff_coeff}} = {{answer}}.',
      ],
    },
    {
      id: 'science-room-2',
      roomNumber: 2,
      name: 'The Chemistry Store',
      shortName: 'Chemistry Store',
      emoji: '🧪',
      scene: 'chemistry',
      sectorLabel: 'Lab Room • Sector C',
      clueCode: 'Clue #02-B',
      logHeader: 'ARCHIVED LOG • SCIENCE BLOCK',
      storyText:
        'A locked cabinet holds the chemical you need. The senior students scratched an equation on the shelf label—cross-multiply to unlock the drawer before the judges arrive!',
      problemTemplate: {
        generator: 'linearEqGenerator',
        subtype: 'fraction-cross',
      },
      hints: [
        'Cross-multiply both sides to eliminate the fractions: {{f}}({{lhs_num}}) = {{c}}({{rhs_num}}).',
        'Expand both brackets: {{fa}}x + {{fb}} = {{cd}}x + {{ce}}. Group x terms on one side and constants on the other.',
        'Simplify ({{fa}} − {{cd}})x = {{ce}} − {{fb}} to get x = {{answer}}.',
      ],
    },
    {
      id: 'science-room-3',
      roomNumber: 3,
      name: 'The Biology Lab',
      shortName: 'Biology Lab',
      emoji: '🔬',
      scene: 'biology',
      sectorLabel: 'Bio Lab • Bench 4',
      clueCode: 'Clue #03-C',
      logHeader: 'SLIDE NOTE • BIOLOGY LAB',
      storyText:
        'Under the compound microscope sits a tiny slide containing an age riddle written by last year’s fair winners. Translate the sentences into an equation to unlock the next door.',
      problemTemplate: {
        generator: 'linearEqGenerator',
        subtype: 'age-word',
      },
      hints: [
        "Let {{younger_name}}'s present age be x. Then {{older_name}}'s present age is x + {{age_diff}}.",
        'In {{years_later}} years: (x + {{age_diff}} + {{years_later}}) = {{multiplier}}(x + {{years_later}}).',
        "Expand and solve for x to find {{younger_name}}'s present age: x = {{answer}}.",
      ],
    },
    {
      id: 'science-room-4',
      roomNumber: 4,
      name: 'The Physics Workshop',
      shortName: 'Physics Workshop',
      emoji: '⚡',
      scene: 'physics',
      sectorLabel: 'Workshop • Circuit Bay',
      clueCode: 'Clue #04-D',
      logHeader: 'CIRCUIT LOG • PHYSICS BAY',
      storyText:
        'The circuit cabinet is sealed with a 2-digit dial lock. A schematic note describes how reversing the digits changes the code—find the original 2-digit number.',
      problemTemplate: {
        generator: 'linearEqGenerator',
        subtype: 'digit-reversal',
      },
      hints: [
        'Write the 2-digit number as 10x + y (tens digit x, units digit y) where x + y = {{digit_sum}}.',
        'The reversed number is 10y + x. Subtracting gives 9(y − x) = {{diff}}, so y − x = {{digit_diff}}.',
        'Solving x + y = {{digit_sum}} and y − x = {{digit_diff}} gives x = {{tens}}, y = {{units}}. Original number = {{answer}}.',
      ],
    },
    {
      id: 'science-room-5',
      roomNumber: 5,
      name: 'The Secret Lab',
      shortName: 'Secret Lab',
      emoji: '🧫',
      scene: 'secret-lab',
      sectorLabel: 'Inner Vault • Sector S',
      clueCode: 'Clue #05-E',
      logHeader: 'FINAL SAFE • SECRET LAB',
      storyText:
        'You reached the dark inner lab where the rare compound is stored in a combination safe. Solve the fraction puzzle and enter the numerator to open the vault!',
      problemTemplate: {
        generator: 'linearEqGenerator',
        subtype: 'fraction-word',
      },
      hints: [
        'Let the fraction be n/D. Condition 1 gives (n + {{add_num}})/D = 1/{{b}}, so D = {{b}}(n + {{add_num}}).',
        'Condition 2 gives n/(D − {{sub_den}}) = 1/{{d}}, so D = {{d}}n + {{sub_den}}. Equate both expressions for D.',
        'Solving {{d}}n + {{sub_den}} = {{b}}(n + {{add_num}}) gives n = {{numerator}} (D = {{denominator}}). Lock code = {{answer}}.',
      ],
    },
  ],
};

export default scienceFairEscape;
/**
 * Escape 3: "The Library's Secret Shelf" (Hard — 7 Rooms, Class 10 CBSE Board HOTS)
 * Topic: Quadratic Equations (factoring, reducible fractions, discriminant, word problems, radicals)
 */

const librarySecretEscape = {
  id: 'library-secret',
  title: "The Library's Secret Shelf",
  shortTitle: 'Secret Shelf',
  difficulty: 'hard',
  difficultyLabel: 'HARD',
  topic: 'Quadratic Equations',
  shortTopic: 'Quadratics',
  focusConcept: 'Parabolas & Roots (ax² + bx)',
  classLevel: 'Class 10',
  roomCount: 7,
  icon: '📚',
  accentColor: '#f43f5e',
  description:
    "Crack 7 quadratic locks to find the legendary topper's secret exam shortcuts hidden behind the ancient archive stacks.",
  completionHeadline: 'Legendary! You unlocked the Secret Shelf and claimed the Topper’s Grimoire!',
  completionMessage:
    'All seven Class 10 quadratic locks have fallen—your algebraic rigor is unmatched.',
  rooms: [
    {
      id: 'library-room-1',
      roomNumber: 1,
      name: 'Reference Section',
      shortName: 'Reference',
      emoji: '📚',
      scene: 'reference',
      sectorLabel: 'Library • Sector 1',
      clueCode: 'Cipher #01',
      logHeader: 'BOOKMARK CIPHER • REFERENCE',
      storyText:
        'A brass bookmark inside an old NCERT volume points to a locked display case. Split the middle term carefully to uncover the positive root.',
      problemTemplate: {
        generator: 'quadraticGenerator',
        subtype: 'factoring-mixed-signs',
      },
      hints: [
        'Find two integers whose product is {{c}} and whose sum is {{b}} (one positive, one negative).',
        'Splitting the middle term gives (x − {{pos_root}})(x + {{neg_abs}}) = 0.',
        'The roots are x = {{pos_root}} and x = {{neg_root}}. Enter the positive root: {{answer}}.',
      ],
    },
    {
      id: 'library-room-2',
      roomNumber: 2,
      name: 'The Archive Room',
      shortName: 'Archive Room',
      emoji: '🗄️',
      scene: 'archive',
      sectorLabel: 'Library • Sector 2',
      clueCode: 'Cipher #02',
      logHeader: 'CABINET NOTE • ARCHIVES',
      storyText:
        'Deep in the archive room, a steel drawer guards the floor plan of the hidden stacks. Reduce this fraction equation to a quadratic and sum both roots.',
      problemTemplate: {
        generator: 'quadraticGenerator',
        subtype: 'reducible-fraction',
      },
      hints: [
        'Combine the two fractions on the left over the common denominator (x + {{a}})(x − {{b}}).',
        'Cross-multiplying yields (x + {{a}})(x − {{b}}) = −{{k}}, which rearranges to x² − {{sum_roots}}x + {{prod_roots}} = 0.',
        'Factoring gives (x − {{r1}})(x − {{r2}}) = 0 → roots {{r1}} and {{r2}}. Sum = {{answer}}.',
      ],
    },
    {
      id: 'library-room-3',
      roomNumber: 3,
      name: 'The Mezzanine',
      shortName: 'Mezzanine',
      emoji: '🪜',
      scene: 'mezzanine',
      sectorLabel: 'Library • Sector 3',
      clueCode: 'Cipher #03',
      logHeader: 'IRON GATE • MEZZANINE',
      storyText:
        'An iron gate blocks the spiral stairs to the mezzanine. The topper left a discriminant test engraved on the plaque—find the positive parameter k for equal roots.',
      problemTemplate: {
        generator: 'quadraticGenerator',
        subtype: 'find-k-equal-roots',
      },
      hints: [
        'For equal roots, the discriminant must vanish: D = B² − 4AC = 0.',
        'Substitute A = k + {{a}}, B = k + ({{b}}), and C = {{c}} into B² − 4AC = 0 and expand.',
        'Solving the quadratic in k gives k = {{k_pos}} or k = {{k_neg}}. The positive value is {{answer}}.',
      ],
    },
    {
      id: 'library-room-4',
      roomNumber: 4,
      name: 'The Map Alcove',
      shortName: 'Map Alcove',
      emoji: '🗺️',
      scene: 'map-alcove',
      sectorLabel: 'Library • Sector 4',
      clueCode: 'Cipher #04',
      logHeader: 'WALL SAFE • MAP ALCOVE',
      storyText:
        'Behind a vintage map of India hides a recessed wall safe. Use the geometry clues about two square floor tiles to compute the smaller side length.',
      problemTemplate: {
        generator: 'quadraticGenerator',
        subtype: 'two-squares-word',
      },
      hints: [
        'Since perimeter = 4 × side, a perimeter difference of {{diff_perim}} m means the sides differ by {{diff}} m.',
        'Let smaller side = x m and larger side = (x + {{diff}}) m. Setting x² + (x + {{diff}})² = {{sum_areas}} simplifies to x² + {{diff}}x − {{product}} = 0.',
        'Factoring gives (x + {{s2}})(x − {{s1}}) = 0. Rejecting negative length leaves {{answer}} m.',
      ],
    },
    {
      id: 'library-room-5',
      roomNumber: 5,
      name: 'The Reading Nook',
      shortName: 'Reading Nook',
      emoji: '🕯️',
      scene: 'reading-nook',
      sectorLabel: 'Library • Sector 5',
      clueCode: 'Cipher #05',
      logHeader: 'TIMETABLE CHEST • NOOK',
      storyText:
        'By candlelight in the corner reading nook rests an oak chest with a railway-themed cipher. Frame the speed-distance quadratic to find the train’s original speed.',
      problemTemplate: {
        generator: 'quadraticGenerator',
        subtype: 'speed-distance-word',
      },
      hints: [
        'Use Time = Distance ÷ Speed: {{distance}}/x − {{distance}}/(x + {{extra_speed}}) = {{time_saved}}.',
        'Clear denominators and rearrange into the quadratic x² + {{extra_speed}}x − {{product}} = 0.',
        'Factoring gives (x + {{new_speed}})(x − {{speed}}) = 0. Rejecting negative speed yields {{answer}} km/h.',
      ],
    },
    {
      id: 'library-room-6',
      roomNumber: 6,
      name: "The Librarian's Desk",
      shortName: "Librarian's Desk",
      emoji: '🔑',
      scene: 'librarian-desk',
      sectorLabel: 'Library • Sector 6',
      clueCode: 'Cipher #06',
      logHeader: 'KEY DRAWER • LIBRARIAN DESK',
      storyText:
        'A radical cipher guards the master key drawer. Watch out for extraneous roots—check both candidate solutions in the original equation!',
      problemTemplate: {
        generator: 'quadraticGenerator',
        subtype: 'radical-extraneous',
      },
      hints: [
        'Isolate the square root first: √({{a}}x + {{b}}) = {{c}} − x, then square both sides.',
        'Rearranging gives x² + ({{quad_b}})x + {{quad_c}} = 0, which factors to (x − {{x_valid}})(x − {{extraneous}}) = 0.',
        'Check both roots! x = {{extraneous}} gives {{extraneous_lhs}} ≠ {{c}} (rejected as extraneous). Valid root: x = {{answer}}.',
      ],
    },
    {
      id: 'library-room-7',
      roomNumber: 7,
      name: 'The Secret Shelf',
      shortName: 'Secret Shelf',
      emoji: '📕',
      scene: 'secret-shelf',
      sectorLabel: 'The Library’s Secret Shelf • Sector 7',
      clueCode: 'Cipher #07',
      logHeader: 'FINAL SEAL • SECRET SHELF',
      storyText:
        'The hidden bookshelf slides open, revealing a leather-bound notebook sealed with one final commerce riddle. Crack the cost price to claim the topper’s shortcuts!',
      problemTemplate: {
        generator: 'quadraticGenerator',
        subtype: 'commerce-profit-word',
      },
      hints: [
        'Let Cost Price = ₹x. Since Profit % = x%, Selling Price = x + (x/100) × x = ₹{{selling_price}}.',
        'Multiply both sides by 100: x² + 100x − {{selling_price}}00 = 0.',
        'Factoring gives (x + {{neg_factor}})(x − {{cp}}) = 0. Since Cost Price must be positive, CP = ₹{{answer}}.',
      ],
    },
  ],
};

export default librarySecretEscape;
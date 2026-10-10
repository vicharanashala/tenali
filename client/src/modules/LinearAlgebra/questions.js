/**
 * Cluster 1 — Stage 1: Point
 *
 * Goal: The learner earns the idea of a "spot" through observation.
 * The word "point" is never used inside the questions — it is offered as a
 * naming choice at the head of Stage 2 (Naming Handover).
 *
 * Faithfully adapted from Conceptual questions/clusters/cluster 1.md
 */

export const ENVIRONMENTS = [
  { id: 'room', label: 'In a room', icon: '🏠', note: 'wall or ceiling' },
  { id: 'outside', label: 'Outside (street, park, beach, etc.)', icon: '🌳', note: 'open ground or street' },
  { id: 'vehicle', label: 'In a vehicle (car, bus, train)', icon: '🚗', note: 'interior transit' }
];

export const ENVIRONMENT_OBJECTS = {
  room: ['Bulb', 'Clock', 'Hanger', 'Switch'],
  outside: ['Tree', 'Sign', 'Lamp Post', 'Bench'],
  vehicle: ['Handle', 'Window', 'Seat']
};

export const UNSEEN_OBJECTS_DESCRIPTIONS = {
  room: 'in the room behind you, where a chair sits',
  outside: 'behind you, where a bench or tree sits',
  vehicle: 'behind you, where a seat sits'
};

export const UNSEEN_SPOTS_PRESETS = {
  room: ['Behind me on the chair', 'Under the desk', 'Behind the wall'],
  outside: ['Behind me on the bench', 'Behind the tree trunk', 'Across the path behind me'],
  vehicle: ['Behind my seat', 'In the trunk / back', 'Under the seat']
};

export const PATH_META = {
  title: 'Understanding the Point',
  subtitle: 'A Discovery Journey: From Physical Observation to Pure Location',
  totalQuestions: 11
};

export const PHASES = [
  { id: 1, name: 'Phase 1: Noticing the Spot', range: [1, 5] },
  { id: 2, name: 'Phase 2: Why We Draw Marks', range: [6, 6] },
  { id: 3, name: 'Phase 3: The Spot Has No Size', range: [7, 8] },
  { id: 4, name: 'Phase 4: A Spot Exists Unseen', range: [9, 11] }
];

export const POINT_PATH_QUESTIONS = [
  {
    id: 1,
    phaseId: 1,
    phaseTitle: 'Phase 1: Noticing the Spot',
    title: 'Physical Surroundings',
    prompt: 'Where are you right now?',
    subtext: 'Choose the environment that best matches your surroundings:',
    type: 'environment_select'
  },
  {
    id: 2,
    phaseId: 1,
    phaseTitle: 'Phase 1: Noticing the Spot',
    title: 'Spot an Object',
    prompt: 'Look around. Is there an object you can point at?',
    subtext: 'Choose an object in your surroundings (or select one that best matches what you see):',
    type: 'object_select'
  },
  {
    id: 3,
    phaseId: 1,
    phaseTitle: 'Phase 1: Noticing the Spot',
    title: 'Where Does Your Finger Land?',
    prompt: 'Point your finger at it. Where is your finger aimed — at the object itself, or at the spot where the object is?',
    subtext: 'Think about it: The chosen object has size, weight, and volume. Where does your point of gaze really land?',
    type: 'mcq_spot_aim',
    correct: 1,
    creditExplanation: 'Your finger lands on the spot, not the whole object.',
    noCreditExplanation: 'Your finger lands on a single spot, not the whole object.'
  },
  {
    id: 4,
    phaseId: 1,
    phaseTitle: 'Phase 1: Noticing the Spot',
    title: 'Drawing a Dot',
    prompt: 'Now, take any piece of paper in front of you. Draw a tiny dot on it — just one small dot, nothing else. Done?',
    subtext: 'Draw it physically on paper in front of you, or confirm using the digital dot canvas below:',
    type: 'draw_dot',
    buttonText: 'Done — Dot is Drawn! ✓'
  },
  {
    id: 5,
    phaseId: 1,
    phaseTitle: 'Phase 1: Noticing the Spot',
    title: 'Representation vs. Occupation',
    prompt: 'Of the two — which one represents the place in space (stands in for it), and which one occupies it (has a body, is at it)?',
    subtext: 'Comparing: The drawn dot on paper vs. Your chosen object.',
    type: 'mcq_represent_occupy',
    correct: 0,
    creditExplanation: 'The drawn dot is a stand-in for the spot; the object has a body and is at the spot.',
    noCreditExplanation: 'The drawn dot has no body, so it does not occupy; the object has a physical body and occupies that spot in space.'
  },
  {
    id: 6,
    phaseId: 2,
    phaseTitle: 'Phase 2: Why We Draw Marks',
    title: 'Why Draw Marks?',
    prompt: 'Why do we draw dots / marks on paper at all when we want to mark a spot?',
    subtext: 'Consider why mathematicians and humans put marks down when talking about locations:',
    type: 'mcq_why_draw',
    options: [
      'Because circles look pretty',
      "Because it's a tradition",
      'Because we have to put something visible on paper',
      'Because circles are the easiest shape to draw'
    ],
    correct: 2,
    creditExplanation: 'The point itself cannot be drawn; we need a stand-in (the smallest visible thing on paper).',
    noCreditExplanation: 'A pure spot has no color or ink — without drawing a visible stand-in, paper remains completely blank.'
  },
  {
    id: 7,
    phaseId: 3,
    phaseTitle: 'Phase 3: The Spot Has No Size',
    title: 'Body & Dimensions of the Object',
    prompt: 'Does the object have size, like a body — length, width, something you can see?',
    subtext: 'Look at the 3D model: Notice it has physical width, height, and depth in space.',
    type: 'yes_no_size',
    choices: ['Yes, it has physical size / body', 'No']
  },
  {
    id: 8,
    phaseId: 3,
    phaseTitle: 'Phase 3: The Spot Has No Size',
    title: 'Size of the Spot',
    prompt: 'Does the spot have size too, or only the object?',
    subtext: 'Think carefully: Does a location in empty space take up volume, or does it have zero size?',
    type: 'spot_size_input',
    options: [
      'Only the object has size (the spot has zero size)',
      'Both have size',
      'Neither has size',
      'Only the spot has size'
    ],
    correct: 0,
    creditKeywords: ['only the object', 'spot has no size', 'no size', 'just the object', 'only object', 'zero size', 'neither has size is false', 'object has size'],
    creditExplanation: 'The spot has no size — only the object occupying it has physical size.',
    noCreditExplanation: 'A spot is purely a location; it has no length, width, or thickness whatsoever.'
  },
  {
    id: 9,
    phaseId: 4,
    phaseTitle: 'Phase 4: A Spot Exists Unseen',
    title: 'A Spot You Aren’t Looking At',
    prompt: 'Pick a spot in your surroundings that you are NOT looking at right now.',
    subtext: 'It could be behind you, under something, or outside your forward line of sight. Select a location below or type your own:',
    type: 'pick_unseen_spot',
    creditExplanation: 'You have identified a real location in space outside your direct line of sight.'
  },
  {
    id: 10,
    phaseId: 4,
    phaseTitle: 'Phase 4: A Spot Exists Unseen',
    title: 'Picture It Mentally',
    prompt: 'Without turning your head or looking away from the screen, can you picture that spot in your mind?',
    subtext: 'Your physical eyes look straight ahead at the screen, but your mind can navigate 360° of space all around you:',
    type: 'picture_mentally_mcq',
    options: [
      'Yes, I can picture and locate it in my mind',
      'No, I cannot picture it'
    ],
    correct: 0,
    creditExplanation: 'You can mentally hold and locate a spot in space without needing your physical eyes to look at it.',
    noCreditExplanation: 'Try thinking of a familiar spot nearby, like the floor under your desk or the wall behind you.'
  },
  {
    id: 11,
    phaseId: 4,
    phaseTitle: 'Phase 4: A Spot Exists Unseen',
    title: 'The Spot Still Exists',
    prompt: 'Does that spot exist in space right now, even though no one is looking at it?',
    subtext: 'Does empty space depend on human eyes, or do locations exist unconditionally?',
    type: 'spot_existence_mcq',
    options: [
      'Yes, the spot exists in space unseen',
      'No, it only exists when seen'
    ],
    correct: 0,
    placeholder: 'Add one short reflection (e.g. A spot is a real location in space; it doesn\'t need eyes...)',
    creditExplanation: 'A spot is a location in space; it exists unconditionally and does not need eyes or light to exist.',
    noCreditExplanation: 'Space and the locations within it do not disappear when nobody is looking.'
  }
];

export const CLUSTER_1_SUMMARY = {
  title: 'Understanding the Point: Complete!',
  namingHandover: {
    title: 'The Naming Handover',
    quote: "From now on, we'll call what you've been calling 'spot' a POINT. The word 'point' is just a name — a shorthand. You can still call it a spot if you like. The idea matters more than the word."
  },
  takeaways: [
    'A spot is a place / location, not the object that sits at it.',
    'The drawn dot, your finger, a screen pixel — all are stand-ins for the same spot.',
    'A drawing is a stand-in; an object has a body and occupies a place.',
    'We need stand-ins because we cannot draw "nothing" on paper.',
    'A spot has no size — only the object at the spot has size.',
    'A spot can be thought of without being seen, drawn, or pointed at.'
  ],
  nextCluster: 'Next Destination: Space (If a point is a location, what kind of place is the location in?)'
};

// Aliases for compatibility
export const CLUSTER_1_QUESTIONS = POINT_PATH_QUESTIONS;
export const INITIAL_QUESTIONS = POINT_PATH_QUESTIONS;
export const CONCEPTUAL_QUESTIONS = POINT_PATH_QUESTIONS;

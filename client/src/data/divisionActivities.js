/**
 * Data-driven configurations for Division Fair Sharing Demonstrations and Activities.
 * Uses character IDs ('maya', 'rohan', 'priya', 'leo', 'sam') with zero emojis.
 */

export const DIVISION_DEMOS = [
  {
    id: 'demo-1',
    total: 4,
    friends: 2,
    friendNames: ['Maya', 'Rohan'],
    characterIds: ['maya', 'rohan'],
    remainder: 0,
    speedMs: 1400
  },
  {
    id: 'demo-2',
    total: 6,
    friends: 2,
    friendNames: ['Priya', 'Leo'],
    characterIds: ['priya', 'leo'],
    remainder: 0,
    speedMs: 1200
  },
  {
    id: 'demo-3',
    total: 7,
    friends: 2,
    friendNames: ['Sam', 'Maya'],
    characterIds: ['sam', 'maya'],
    remainder: 1,
    speedMs: 1200
  }
];

export const DIVISION_ACTIVITIES = [
  {
    id: 1,
    title: 'Activity 1',
    subtitle: 'Exact Sharing',
    hasRemainder: false,
    guidanceLevel: 'high',
    problems: [
      { total: 6, friends: 2, friendNames: ['Maya', 'Rohan'], characterIds: ['maya', 'rohan'] },
      { total: 8, friends: 4, friendNames: ['Leo', 'Priya', 'Sam', 'Maya'], characterIds: ['leo', 'priya', 'sam', 'maya'] },
      { total: 9, friends: 3, friendNames: ['Rohan', 'Priya', 'Leo'], characterIds: ['rohan', 'priya', 'leo'] }
    ]
  },
  {
    id: 2,
    title: 'Activity 2',
    subtitle: 'Larger Exact Sharing',
    hasRemainder: false,
    guidanceLevel: 'medium',
    problems: [
      { total: 10, friends: 2, friendNames: ['Priya', 'Sam'], characterIds: ['priya', 'sam'] },
      { total: 12, friends: 3, friendNames: ['Maya', 'Rohan', 'Leo'], characterIds: ['maya', 'rohan', 'leo'] },
      { total: 12, friends: 4, friendNames: ['Sam', 'Priya', 'Maya', 'Rohan'], characterIds: ['sam', 'priya', 'maya', 'rohan'] }
    ]
  },
  {
    id: 3,
    title: 'Activity 3',
    subtitle: 'Remainder Discovery',
    hasRemainder: true,
    guidanceLevel: 'medium',
    problems: [
      { total: 7, friends: 2, friendNames: ['Maya', 'Priya'], characterIds: ['maya', 'priya'] },
      { total: 10, friends: 3, friendNames: ['Rohan', 'Leo', 'Sam'], characterIds: ['rohan', 'leo', 'sam'] },
      { total: 11, friends: 4, friendNames: ['Maya', 'Rohan', 'Priya', 'Leo'], characterIds: ['maya', 'rohan', 'priya', 'leo'] }
    ]
  },
  {
    id: 4,
    title: 'Activity 4',
    subtitle: 'Independent Challenge',
    hasRemainder: true,
    guidanceLevel: 'minimal',
    problems: [
      { total: 14, friends: 3, friendNames: ['Sam', 'Maya', 'Rohan'], characterIds: ['sam', 'maya', 'rohan'] },
      { total: 15, friends: 4, friendNames: ['Priya', 'Leo', 'Sam', 'Maya'], characterIds: ['priya', 'leo', 'sam', 'maya'] },
      { total: 16, friends: 5, friendNames: ['Maya', 'Rohan', 'Priya', 'Leo', 'Sam'], characterIds: ['maya', 'rohan', 'priya', 'leo', 'sam'] }
    ]
  }
];

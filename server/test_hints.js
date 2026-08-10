const { buildHints } = require('./hints/hintSpecs');

const conceptsToTest = [
  {
    concept: 'addition',
    qData: { op: '+', a: 123, b: 456 },
    aData: { correctAnswer: 579 },
    explanation: 'Step 1: Add ones...'
  },
  {
    concept: 'multiply',
    qData: { op: '×', table: 23, multiplier: 4 },
    aData: { correctAnswer: 92 }
  },
  {
    concept: 'vocab',
    qData: { word: 'brave', question: 'What means brave?' },
    aData: { correctAnswerText: 'courageous' }
  },
  {
    concept: 'sets',
    qData: { prompt: 'Find the union' }
  },
  {
    concept: 'pythag',
    qData: { prompt: 'Find hypotenuse' }
  }
];

console.log('--- Testing Hint Generation ---\n');

conceptsToTest.forEach(t => {
  console.log(`=== Concept: ${t.concept} ===`);
  try {
    const hints = buildHints(t.concept, t.qData, t.aData, t.explanation);
    console.log('L1:', hints.level1 ? hints.level1.slice(0, 100).replace(/\n/g, ' ') + '...' : 'null');
    console.log('L2:', hints.level2 ? hints.level2.slice(0, 100).replace(/\n/g, ' ') + '...' : 'null');
    console.log('L3:', hints.level3 ? hints.level3.slice(0, 100).replace(/\n/g, ' ') + '...' : 'null');
    
    // Check if SVG is present in L1
    if (hints.level1 && hints.level1.includes('<svg-hint>')) {
      console.log('✅ L1 contains SVG');
    } else {
      console.log('❌ L1 missing SVG (or not applicable)');
    }
  } catch (err) {
    console.error('ERROR generating hints:', err);
  }
  console.log('\n');
});

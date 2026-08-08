const { CONCEPTS } = require('./hints/hintSpecs');

async function runTests() {
  console.log('Fetching questions for all concepts to test L3 masking...');
  
  const concepts = Object.keys(CONCEPTS).filter(k => k !== '_default');
  let failures = [];
  const difficulties = ['easy', 'medium', 'hard'];
  
  for (const concept of concepts) {
    for (const diff of difficulties) {
      try {
        const qRes = await fetch(`http://localhost:5000/${concept}-api/question?difficulty=${diff}`);
        if (!qRes.ok) continue;
        const qData = await qRes.json();
        
        const unlockRes = await fetch(`http://localhost:5000/api/hints/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concept,
            questionId: `test_q_${concept}_${diff}`,
            level: 3,
            questionData: qData,
            answerData: { correctAnswer: qData.answer }
          })
        });
        
        if (!unlockRes.ok) continue;
        const unlockData = await unlockRes.json();
        const hintText = unlockData.hint;
        
        const ansStr = String(qData.answer).trim();
        if (ansStr && ansStr !== 'undefined' && hintText.includes(ansStr)) {
          if (ansStr.length > 1 || (Number(ansStr) > 4)) {
             failures.push({
               concept,
               diff,
               answer: ansStr,
               hintText: hintText
             });
          }
        }
      } catch (err) {}
    }
  }
  
  console.log(`\n=== FAILED CONCEPTS (${failures.length}) ===`);
  for (const f of failures) {
    console.log(`\nConcept: ${f.concept} (${f.diff}) | Answer: ${f.answer}`);
    console.log(`Text:\n${f.hintText}\n-----------------`);
  }
  console.log('\nTesting Complete.');
}

runTests();

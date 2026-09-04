const fs = require('fs');
const { CONCEPTS } = require('./hints/hintSpecs');

async function run() {
  console.log('Generating Hint Progression Report...');
  const concepts = Object.keys(CONCEPTS).filter(k => k !== '_default');
  
  let report = `# Hint Progression Report\n\nThis document shows the actual Level 1, Level 2, and Level 3 hints generated for every question type in the application. Use this to verify the progression and specificity of the hints.\n\n`;

  for (const concept of concepts) {
    try {
      // 1. Fetch a question
      const qRes = await fetch(`http://localhost:5000/${concept}-api/question?difficulty=easy`);
      if (!qRes.ok) continue;
      const qData = await qRes.json();
      
      report += `## Concept: \`${concept}\`\n`;
      report += `**Sample Prompt:** ${qData.prompt || qData.question || 'N/A'}\n\n`;
      
      // 2. Fetch L1
      const l1Res = await fetch(`http://localhost:5000/api/hints/unlock`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, questionId: 'test1_' + concept, level: 1, questionData: qData, answerData: { correctAnswer: qData.answer } })
      });
      const l1Data = await l1Res.json();
      report += `### Level 1 Hint\n\`\`\`text\n${l1Data.hint}\n\`\`\`\n\n`;

      // 3. Fetch L2
      const l2Res = await fetch(`http://localhost:5000/api/hints/unlock`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, questionId: 'test1_' + concept, level: 2, questionData: qData, answerData: { correctAnswer: qData.answer } })
      });
      const l2Data = await l2Res.json();
      report += `### Level 2 Hint\n\`\`\`text\n${l2Data.hint}\n\`\`\`\n\n`;

      // 4. Fetch L3
      const l3Res = await fetch(`http://localhost:5000/api/hints/unlock`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, questionId: 'test1_' + concept, level: 3, questionData: qData, answerData: { correctAnswer: qData.answer } })
      });
      const l3Data = await l3Res.json();
      report += `### Level 3 Hint (Explanation)\n\`\`\`text\n${l3Data.hint}\n\`\`\`\n\n`;
      
      report += `---\n\n`;
    } catch (err) {
      report += `## Concept: \`${concept}\`\n*Failed to fetch or generate hints: ${err.message}*\n\n---\n\n`;
    }
  }

  // Write to artifact dir
  const artifactPath = 'C:\\\\Users\\\\DELL\\\\.gemini\\\\antigravity-ide\\\\brain\\\\31ff87f9-c977-4d7c-a4ba-6db16f21b812\\\\all_hints_progression.md';
  fs.writeFileSync(artifactPath, report);
  console.log('Report saved to: ' + artifactPath);
}

// node-fetch is global in Node 22, let's remove require if needed but fetch works.
// Actually, fetch is global, so I'll just remove the require.
run();

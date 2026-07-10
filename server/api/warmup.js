const express = require('express');
const router = express.Router();

router.get('/:apiPath', async (req, res) => {
  try {
    const apiPath = req.params.apiPath;
    const port = process.env.PORT || 4000;
    
    // Fetch 3 warmup questions from the respective endpoints
    const questions = [];
    for (let i = 0; i < 3; i++) {
       const resp = await fetch(`http://127.0.0.1:${port}/${apiPath}/question?difficulty=easy&q=${Date.now()}_${i}`);
       if (resp.ok) {
         questions.push(await resp.json());
       }
    }
    
    // Map answer format for consistency
    questions.forEach(q => {
       if (q.correctAnswer !== undefined && q.answer === undefined) {
         q.answer = q.correctAnswer;
       }
       if (q.correctAnswerText !== undefined && q.answer === undefined) {
         q.answer = q.correctAnswerText;
       }
       // Some endpoints use `display` field for correct answer
       if (q.display !== undefined && q.answer === undefined) {
         q.answer = q.display;
       }
    });

    res.json(questions);
  } catch (error) {
    console.error('Warmup fetch error:', error);
    res.status(500).json({ error: 'Failed to generate warmup questions' });
  }
});

module.exports = router;

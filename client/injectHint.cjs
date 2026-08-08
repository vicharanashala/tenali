const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
const hintCode = `      <HintModal
        concept={typeof apiPath !== 'undefined' && apiPath ? apiPath.split('-')[0] : 'gk'}
        questionId={typeof question !== 'undefined' && question ? question._id : null}
        questionData={typeof question !== 'undefined' ? question : null}
        answerData={{
          answer: typeof answer !== 'undefined' ? answer : '',
          correctOption: typeof correctOption !== 'undefined' ? correctOption : '',
          isCorrect: typeof isCorrect !== 'undefined' ? (isCorrect || false) : false
        }}
        revealed={typeof isCorrect !== 'undefined' ? (isCorrect !== null) : false}
      />
    </QuizLayout>`;
code = code.replace(/<\/QuizLayout>/g, hintCode);
fs.writeFileSync('src/App.jsx', code);
console.log('Injected HintModal into all QuizLayouts');

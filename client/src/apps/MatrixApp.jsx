import { makeQuizApp } from '../App.jsx'

const MatrixApp = makeQuizApp({
  title: 'Matrices', subtitle: 'Add, multiply, determinant', apiPath: 'matrix-api', topicKey: 'matrices',
  diffLabels: { easy: 'Easy — Addition', medium: 'Medium — Scalar ×', hard: 'Hard — Determinant', extrahard: 'Extra Hard — Multiply' },
  placeholders: (q, d) => d === 'hard' ? 'e.g. 7' : 'e.g. [1,2;3,4]',
  tip: 'Enter matrices as [a,b;c,d] — semicolon separates rows',
})

export default MatrixApp

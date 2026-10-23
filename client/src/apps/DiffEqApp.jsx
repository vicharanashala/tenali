import { makeQuizApp } from '../App.jsx'

const DiffEqApp = makeQuizApp({
  title: 'Differential Equations', subtitle: 'Order, degree, solve DEs', apiPath: 'diffeq-api', topicKey: 'differential-equations',
  diffLabels: { easy: 'Easy — Find order', medium: 'Medium — Find degree', hard: 'Hard — Verify solution', extrahard: 'Extra Hard — Solve separable' },
  placeholders: (q, d) => d === 'hard' ? 'yes or no' : 'e.g. 2',
})

export default DiffEqApp

import { makeQuizApp } from '../App.jsx'

const IneqApp = makeQuizApp({
  title: 'Inequalities', subtitle: 'Linear & quadratic inequalities', apiPath: 'ineq-api', topicKey: 'inequalities',
  diffLabels: { easy: 'Easy — Linear', medium: 'Medium — List integers', hard: 'Hard — Quadratic', extrahard: 'Extra Hard — Count' },
  placeholders: (q, d) => d === 'easy' ? 'e.g. x > 3' : d === 'medium' ? 'e.g. -1, 0, 1, 2' : d === 'hard' ? 'e.g. 1<=x<=5' : 'e.g. 7',
  tip: 'Use >= for ≥ and <= for ≤',
})

export default IneqApp

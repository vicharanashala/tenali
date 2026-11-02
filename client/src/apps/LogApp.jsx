import { makeQuizApp } from '../App.jsx'

const LogApp = makeQuizApp({
  title: 'Logarithms', subtitle: 'Evaluate, simplify, solve', apiPath: 'log-api', topicKey: 'logarithms',
  diffLabels: { easy: 'Easy — Evaluate', medium: 'Medium — Laws of logs', hard: 'Hard — Solve bˣ = n', extrahard: 'Extra Hard — Log equations' },
  placeholders: (q, d) => d === 'medium' ? 'e.g. 40 (the argument)' : 'e.g. 3',
})

export default LogApp

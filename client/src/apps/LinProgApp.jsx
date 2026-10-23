import { makeQuizApp } from '../App.jsx'

const LinProgApp = makeQuizApp({
  title: 'Linear Programming', subtitle: 'Optimize objective functions', apiPath: 'linprog-api', topicKey: 'linear-programming',
  diffLabels: { easy: 'Easy — Evaluate at vertex', medium: 'Medium — Max from vertices', hard: 'Hard — 2-constraint LP', extrahard: 'Extra Hard — 3-constraint LP' },
  placeholders: 'e.g. 42',
})

export default LinProgApp

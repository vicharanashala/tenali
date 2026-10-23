import { makeQuizApp } from '../App.jsx'

const DiffApp = makeQuizApp({
  title: 'Differentiation', subtitle: 'Power rule, turning points', apiPath: 'diff-api', topicKey: 'differentiation',
  diffLabels: { easy: 'Easy — Power rule', medium: 'Medium — Polynomial', hard: 'Hard — Turning point x', extrahard: 'Extra Hard — Min/Max value' },
  placeholders: 'e.g. 12 or -3/2',
})

export default DiffApp

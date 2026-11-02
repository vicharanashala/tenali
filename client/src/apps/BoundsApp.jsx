import { makeQuizApp } from '../App.jsx'

const BoundsApp = makeQuizApp({
  title: 'Bounds', subtitle: 'Upper & lower bounds, error intervals', apiPath: 'bounds-api', topicKey: 'bounds',
  diffLabels: { easy: 'Easy — Lower bound', medium: 'Medium — Nearest 10', hard: 'Hard — Sum bounds', extrahard: 'Extra Hard — Division bounds' },
  placeholders: 'e.g. 4.25',
})

export default BoundsApp

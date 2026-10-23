import { makeQuizApp } from '../App.jsx'

const AnglesApp = makeQuizApp({
  title: 'Angles', subtitle: 'Lines, points, parallel line angles', apiPath: 'angles-api', topicKey: 'angles',
  diffLabels: { easy: 'Easy — Straight line', medium: 'Medium — At a point', hard: 'Hard — Vertically opposite', extrahard: 'Extra Hard — Parallel lines' },
  placeholders: 'e.g. 65',
})

export default AnglesApp

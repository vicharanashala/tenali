import { makeQuizApp } from '../App.jsx'

const ConicsApp = makeQuizApp({
  title: 'Conic Sections', subtitle: 'Circle, parabola, ellipse, hyperbola', apiPath: 'conics-api', topicKey: 'conic-sections',
  diffLabels: { easy: 'Easy — Identify conic', medium: 'Medium — Circle radius', hard: 'Hard — Eccentricity', extrahard: 'Extra Hard — Focus of parabola' },
  placeholders: (q, d) => d === 'easy' ? 'e.g. circle' : 'e.g. 5',
})

export default ConicsApp

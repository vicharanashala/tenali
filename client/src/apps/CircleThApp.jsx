import { makeQuizApp } from '../App.jsx'

const CircleThApp = makeQuizApp({
  title: 'Circle Theorems', subtitle: 'Angles, tangents, cyclic quads', apiPath: 'circleth-api', topicKey: 'circle-theorems',
  diffLabels: { easy: 'Easy — Semicircle', medium: 'Medium — Centre/Circum', hard: 'Hard — Cyclic quad', extrahard: 'Extra Hard — Tangent' },
  placeholders: 'e.g. 45',
})

export default CircleThApp

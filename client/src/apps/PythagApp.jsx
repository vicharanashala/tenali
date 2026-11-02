import { makeQuizApp } from '../App.jsx'

const PythagApp = makeQuizApp({
  title: "Pythagoras' Theorem", subtitle: 'Hypotenuse, legs, 3D diagonal', apiPath: 'pythag-api', topicKey: 'pythagoras-theorem',
  diffLabels: { easy: 'Easy — Hypotenuse', medium: 'Medium — Shorter side', hard: 'Hard — Word problem', extrahard: 'Extra Hard — 3D diagonal' },
  placeholders: 'e.g. 13',
})

export default PythagApp

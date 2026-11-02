import { makeQuizApp } from '../App.jsx'

const TrigApp = makeQuizApp({
  title: 'Trigonometry', subtitle: 'SOH-CAH-TOA, sine/cosine rule', apiPath: 'trig-api', topicKey: 'trigonometry',
  diffLabels: { easy: 'Easy — Pythagoras', medium: 'Medium — Find Angle', hard: 'Hard — Sine Rule', extrahard: 'Extra Hard — Cosine/Area' },
  placeholders: 'e.g. 13 or 45.5',
})

export default TrigApp

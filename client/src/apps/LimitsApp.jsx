import { makeQuizApp } from '../App.jsx'

const LimitsApp = makeQuizApp({
  title: 'Limits', subtitle: 'Evaluate limits', apiPath: 'limits-api', topicKey: 'limits',
  diffLabels: { easy: 'Easy — Direct sub', medium: 'Medium — Factorable', hard: 'Hard — Trig limits', extrahard: 'Extra Hard — Limits at infinity' },
  placeholders: 'e.g. 4 or 0.5',
})

export default LimitsApp

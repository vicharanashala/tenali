import { makeQuizApp } from '../App.jsx'

const IntegApp = makeQuizApp({
  title: 'Integration', subtitle: 'Reverse differentiation & areas', apiPath: 'integ-api', topicKey: 'integration',
  diffLabels: { easy: 'Easy — Power rule', medium: 'Medium — Definite integral', hard: 'Hard — Substitution', extrahard: 'Extra Hard — Area under curve' },
  placeholders: 'e.g. 3/4', tip: 'Use fractions like 3/4 if needed',
})

export default IntegApp

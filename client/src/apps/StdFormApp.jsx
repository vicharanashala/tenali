import { makeQuizApp } from '../App.jsx'

const StdFormApp = makeQuizApp({
  title: 'Standard Form', subtitle: 'Scientific notation operations', apiPath: 'stdform-api', topicKey: 'standard-form',
  diffLabels: { easy: 'Easy — Convert', medium: 'Medium — Multiply', hard: 'Hard — Divide', extrahard: 'Extra Hard — Add' },
  placeholders: 'e.g. 3.5 × 10^4', tip: 'Format: a × 10^n',
})

export default StdFormApp

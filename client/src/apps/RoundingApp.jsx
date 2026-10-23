import { makeQuizApp } from '../App.jsx'

const RoundingApp = makeQuizApp({
  title: 'Rounding', subtitle: 'Decimal places, significant figures, estimation', apiPath: 'rounding-api', topicKey: 'rounding',
  diffLabels: { easy: 'Easy — Decimal places', medium: 'Medium — Sig. figures', hard: 'Hard — Truncation', extrahard: 'Extra Hard — Estimation' },
  placeholders: 'e.g. 3.14',
})

export default RoundingApp

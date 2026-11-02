import { makeQuizApp } from '../App.jsx'

const RemFactorApp = makeQuizApp({
  title: 'Remainder Theorem', subtitle: 'Remainder & factor theorem', apiPath: 'remfactor-api', topicKey: 'remainder-theorem',
  diffLabels: { easy: 'Easy — Remainder (deg 2)', medium: 'Medium — Factor check', hard: 'Hard — Remainder (deg 3)', extrahard: 'Extra Hard — Find k' },
  placeholders: 'e.g. 7 or yes/no',
})

export default RemFactorApp

import { makeQuizApp } from '../App.jsx'

const BearingsApp = makeQuizApp({
  title: 'Bearings', subtitle: 'Three-figure bearings', apiPath: 'bearings-api', topicKey: 'bearings',
  diffLabels: { easy: 'Easy — Compass', medium: 'Medium — Back bearing', hard: 'Hard — From coords', extrahard: 'Extra Hard — Components' },
  placeholders: 'e.g. 045 or 270',
})

export default BearingsApp

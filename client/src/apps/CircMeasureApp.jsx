import { makeQuizApp } from '../App.jsx'

const CircMeasureApp = makeQuizApp({
  title: 'Circular Measure', subtitle: 'Radians, arc length, sectors', apiPath: 'circmeasure-api', topicKey: 'circular-measure',
  diffLabels: { easy: 'Easy — Deg→Rad', medium: 'Medium — Rad→Deg', hard: 'Hard — Arc length', extrahard: 'Extra Hard — Sector area' },
  placeholders: 'e.g. 1.57',
})

export default CircMeasureApp

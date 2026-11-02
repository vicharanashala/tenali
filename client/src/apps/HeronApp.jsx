import { makeQuizApp } from '../App.jsx'

const HeronApp = makeQuizApp({
  title: "Heron's Formula", subtitle: 'Triangle area from sides', apiPath: 'heron-api', topicKey: 'herons-formula',
  diffLabels: { easy: 'Easy — Semi-perimeter', medium: 'Medium — Integer area', hard: 'Hard — Decimal area', extrahard: 'Extra Hard — Find side' },
  placeholders: 'e.g. 24',
})

export default HeronApp

import { makeQuizApp } from '../App.jsx'

const SectionApp = makeQuizApp({
  title: 'Section Formula', subtitle: 'Midpoint, section, centroid', apiPath: 'section-api', topicKey: 'section-formula',
  diffLabels: { easy: 'Easy — Midpoint', medium: 'Medium — Internal division', hard: 'Hard — Find ratio', extrahard: 'Extra Hard — Centroid' },
  placeholders: 'e.g. 3,5',
})

export default SectionApp

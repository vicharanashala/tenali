import { makeQuizApp } from '../App.jsx'

const VariationApp = makeQuizApp({
  title: 'Variation', subtitle: 'Direct & inverse proportion equations', apiPath: 'variation-api', topicKey: 'variation',
  diffLabels: { easy: 'Easy — Direct (y∝x)', medium: 'Medium — Inverse (y∝1/x)', hard: 'Hard — y∝x²', extrahard: 'Extra Hard — y∝1/√x' },
  placeholders: 'e.g. 24',
})

export default VariationApp

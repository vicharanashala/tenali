import { makeQuizApp } from '../App.jsx'

const DecimalsApp = makeQuizApp({
  title: 'Decimals', subtitle: 'Add, subtract, multiply, divide', apiPath: 'decimals-api', topicKey: 'decimals',
  diffLabels: { easy: 'Easy — Add', medium: 'Medium — Subtract', hard: 'Hard — Multiply', extrahard: 'Extra Hard — Divide' },
  placeholders: 'e.g. 6.1',
})

export default DecimalsApp

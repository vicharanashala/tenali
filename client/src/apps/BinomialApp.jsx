import { makeQuizApp } from '../App.jsx'

const BinomialApp = makeQuizApp({
  title: 'Binomial Theorem', subtitle: 'Expansions, coefficients, nCr', apiPath: 'binomial-api', topicKey: 'binomial-theorem',
  diffLabels: { easy: 'Easy — nCr', medium: 'Medium — (1+x)^n', hard: 'Hard — (a+bx)^n', extrahard: 'Extra Hard — Specific term' },
  placeholders: 'e.g. 210',
})

export default BinomialApp

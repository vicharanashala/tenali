import { makeQuizApp } from '../App.jsx'

const BankingApp = makeQuizApp({
  title: 'Banking (RD)', subtitle: 'Interest & recurring deposits', apiPath: 'banking-api', topicKey: 'banking',
  diffLabels: { easy: 'Easy — Simple interest', medium: 'Medium — Compound interest', hard: 'Hard — RD maturity', extrahard: 'Extra Hard — Find installment' },
  placeholders: 'e.g. 12600',
})

export default BankingApp

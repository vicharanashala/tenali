import { makeQuizApp } from '../App.jsx'

const ProfitLossApp = makeQuizApp({
  title: 'Profit & Loss', subtitle: 'Cost price, selling price, discounts', apiPath: 'profitloss-api', topicKey: 'profit-and-loss',
  diffLabels: { easy: 'Easy — Find profit', medium: 'Medium — Profit %', hard: 'Hard — Discount', extrahard: 'Extra Hard — Successive discounts' },
  placeholders: 'e.g. 150',
})

export default ProfitLossApp

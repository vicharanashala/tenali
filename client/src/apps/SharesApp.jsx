import { makeQuizApp } from '../App.jsx'

const SharesApp = makeQuizApp({
  title: 'Shares & Dividends', subtitle: 'Shares, dividends, returns', apiPath: 'shares-api', topicKey: 'shares-and-dividends',
  diffLabels: { easy: 'Easy — Find dividend', medium: 'Medium — Income', hard: 'Hard — Return %', extrahard: 'Extra Hard — Buy for target' },
  placeholders: 'e.g. 500',
})

export default SharesApp

import { makeQuizApp } from '../App.jsx'

const InvTrigApp = makeQuizApp({
  title: 'Inverse Trig', subtitle: 'arcsin, arccos, arctan', apiPath: 'invtrig-api', topicKey: 'inverse-trigonometry',
  diffLabels: { easy: 'Easy — Basic values', medium: 'Medium — √ values', hard: 'Hard — Compositions', extrahard: 'Extra Hard — Principal values' },
  placeholders: 'e.g. 30 or 45',
})

export default InvTrigApp

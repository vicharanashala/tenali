import { makeQuizApp } from '../App.jsx'

const CongruenceApp = makeQuizApp({
  title: 'Congruence', subtitle: 'SSS, SAS, ASA, RHS', apiPath: 'congruence-api', topicKey: 'congruence',
  diffLabels: { easy: 'Easy — Find side', medium: 'Medium — Find angle', hard: 'Hard — Name the rule', extrahard: 'Extra Hard — In a figure' },
  placeholders: (q, d) => d === 'hard' ? 'e.g. SAS' : 'e.g. 7',
})

export default CongruenceApp

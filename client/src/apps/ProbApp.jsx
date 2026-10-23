import { makeQuizApp } from '../App.jsx'

const ProbApp = makeQuizApp({
  title: 'Probability', subtitle: 'Single & combined events', apiPath: 'prob-api', topicKey: 'probability',
  diffLabels: { easy: 'Easy — Simple', medium: 'Medium — Independent', hard: 'Hard — Or events', extrahard: 'Extra Hard — No replacement' },
  placeholders: 'e.g. 3/10',
})

export default ProbApp

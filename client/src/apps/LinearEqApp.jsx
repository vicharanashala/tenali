import { makeQuizApp } from '../App.jsx'

const LinearEqApp = makeQuizApp({
  title: 'Linear Equations', subtitle: 'Solve for x', apiPath: 'lineareq-api', topicKey: 'linear-equations',
  diffLabels: { easy: 'Easy — ax+b=c', medium: 'Medium — ax+b=cx+d', hard: 'Hard — a(bx+c)=d', extrahard: 'Extra Hard — (ax+b)/c=d' },
  placeholders: 'e.g. 3 or -2.5',
})

export default LinearEqApp

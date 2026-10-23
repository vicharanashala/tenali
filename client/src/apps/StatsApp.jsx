import { makeQuizApp } from '../App.jsx'

const StatsApp = makeQuizApp({
  title: 'Statistics', subtitle: 'Mean, median, mode, range', apiPath: 'stats-api', topicKey: 'statistics',
  diffLabels: { easy: 'Easy — Mean', medium: 'Medium — Median', hard: 'Hard — Mode/Range', extrahard: 'Extra Hard — Frequency' },
  placeholders: 'e.g. 12 or 7/3',
})

export default StatsApp

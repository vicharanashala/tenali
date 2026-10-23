import { makeQuizApp } from '../App.jsx'

const SDTApp = makeQuizApp({
  title: 'Speed, Distance, Time', subtitle: 'Rate problems & conversions', apiPath: 'sdt-api', topicKey: 'speed-distance-time',
  diffLabels: { easy: 'Easy — Distance', medium: 'Medium — Time', hard: 'Hard — Average speed', extrahard: 'Extra Hard — Convert' },
  placeholders: 'e.g. 120',
})

export default SDTApp

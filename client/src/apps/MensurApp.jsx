import { makeQuizApp } from '../App.jsx'

const MensurApp = makeQuizApp({
  title: 'Mensuration', subtitle: 'Area, volume, surface area', apiPath: 'mensur-api', topicKey: 'mensuration',
  diffLabels: { easy: 'Easy — 2D Area', medium: 'Medium — Circle', hard: 'Hard — Volume', extrahard: 'Extra Hard — Surface Area' },
  placeholders: 'e.g. 150.72',
})

export default MensurApp

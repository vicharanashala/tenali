import { makeQuizApp } from '../App.jsx'

const PolygonsApp = makeQuizApp({
  title: 'Polygons', subtitle: 'Interior & exterior angles, diagonals', apiPath: 'polygons-api', topicKey: 'polygons',
  diffLabels: { easy: 'Easy — Angle sum', medium: 'Medium — Each angle', hard: 'Hard — Find sides', extrahard: 'Extra Hard — Diagonals' },
  placeholders: 'e.g. 540',
})

export default PolygonsApp

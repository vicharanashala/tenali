import { makeQuizApp } from '../App.jsx'

const CoordGeomApp = makeQuizApp({
  title: 'Coordinate Geometry', subtitle: 'Midpoint, distance, gradient', apiPath: 'coordgeom-api', topicKey: 'coordinate-geometry',
  diffLabels: { easy: 'Easy — Midpoint', medium: 'Medium — Distance', hard: 'Hard — Gradient', extrahard: 'Extra Hard — Perp. Bisector' },
  placeholders: (q, d) => d === 'easy' ? 'e.g. (3, 4)' : d === 'hard' || d === 'extrahard' ? 'e.g. 3/4 or 2' : 'e.g. 13',
})

export default CoordGeomApp

import { makeQuizApp } from '../App.jsx'

const VectorsApp = makeQuizApp({
  title: 'Vectors', subtitle: 'Add, scale, magnitude', apiPath: 'vectors-api', topicKey: 'vectors',
  diffLabels: { easy: 'Easy — Addition', medium: 'Medium — Scalar ×', hard: 'Hard — Magnitude', extrahard: 'Extra Hard — Position' },
  placeholders: (q, d) => d === 'hard' ? 'e.g. 13' : 'e.g. (3, -2)',
})

export default VectorsApp

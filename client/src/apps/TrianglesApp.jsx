import { makeQuizApp } from '../App.jsx'

const TrianglesApp = makeQuizApp({
  title: 'Triangles', subtitle: 'Angle sum, isosceles, exterior angle', apiPath: 'triangles-api', topicKey: 'triangles',
  diffLabels: { easy: 'Easy — Angle sum', medium: 'Medium — Isosceles', hard: 'Hard — Exterior angle', extrahard: 'Extra Hard — Multi-step' },
  placeholders: 'e.g. 72',
})

export default TrianglesApp

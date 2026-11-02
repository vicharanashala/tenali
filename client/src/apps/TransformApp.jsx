import { makeQuizApp } from '../App.jsx'

const TransformApp = makeQuizApp({
  title: 'Transformations', subtitle: 'Reflect, translate, rotate, enlarge', apiPath: 'transform-api', topicKey: 'transformations',
  diffLabels: { easy: 'Easy — Reflect', medium: 'Medium — Translate', hard: 'Hard — Rotate', extrahard: 'Extra Hard — Enlarge' },
  placeholders: 'e.g. (-3, 4)',
})

export default TransformApp

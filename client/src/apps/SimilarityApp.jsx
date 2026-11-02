import { makeQuizApp } from '../App.jsx'

const SimilarityApp = makeQuizApp({
  title: 'Similarity', subtitle: 'Scale factor, area & volume ratios', apiPath: 'similarity-api', topicKey: 'similarity',
  diffLabels: { easy: 'Easy — Missing side', medium: 'Medium — Scale factor', hard: 'Hard — Area ratio', extrahard: 'Extra Hard — Volume ratio' },
  placeholders: 'e.g. 24',
})

export default SimilarityApp

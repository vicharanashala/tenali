import { makeQuizApp } from '../App.jsx'

const PermCombApp = makeQuizApp({
  title: 'Perm. & Comb.', subtitle: 'Permutations & combinations', apiPath: 'permcomb-api', topicKey: 'permutations-and-combinations',
  diffLabels: { easy: 'Easy — nPr', medium: 'Medium — nCr', hard: 'Hard — Word problems', extrahard: 'Extra Hard — With/without repetition' },
  placeholders: 'e.g. 120',
})

export default PermCombApp

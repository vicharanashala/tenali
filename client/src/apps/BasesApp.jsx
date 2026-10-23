import { makeQuizApp } from '../App.jsx'

const BasesApp = makeQuizApp({
  title: 'Number Bases', subtitle: 'Binary, decimal, hexadecimal', apiPath: 'bases-api', topicKey: 'number-bases',
  diffLabels: { easy: 'Easy — Dec→Bin', medium: 'Medium — Bin→Dec', hard: 'Hard — Dec→Hex', extrahard: 'Extra Hard — Bin add / Hex→Bin' },
  placeholders: (q, d) => d === 'medium' ? 'e.g. 42' : d === 'hard' ? 'e.g. FF' : 'e.g. 101010',
})

export default BasesApp

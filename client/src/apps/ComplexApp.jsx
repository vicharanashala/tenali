import { makeQuizApp } from '../App.jsx'

const ComplexApp = makeQuizApp({
  title: 'Complex Numbers', subtitle: 'Add, multiply, modulus of complex numbers', apiPath: 'complex-api', topicKey: 'complex-numbers',
  diffLabels: { easy: 'Easy — Addition', medium: 'Medium — Multiplication', hard: 'Hard — Modulus', extrahard: 'Extra Hard — z²' },
  placeholders: (q, d) => d === 'hard' ? 'e.g. 13' : 'e.g. 3,-2 for 3-2i',
  tip: 'For complex answers give a,b where z = a + bi',
})

export default ComplexApp

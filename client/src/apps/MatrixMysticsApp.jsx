import { makeMCQuizApp } from '../App.jsx'

const MatrixMysticsApp = makeMCQuizApp({
  title: 'Matrix Mystics',
  subtitle: 'Linear Algebra — 6 modules, 53 topics',
  apiPath: 'matrixmystics-api',
  adaptiveOnly: true,
  diffLabels: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    extrahard: 'Extra Hard',
  },
  tip: 'All questions are MCQ. Read carefully — options are similar length to test real understanding.',
})

export default MatrixMysticsApp

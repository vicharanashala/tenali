import { makeMCQuizApp } from '../App.jsx'

const GymDecimalsApp = makeMCQuizApp({
  title: 'Gym Decimals', subtitle: 'Signed decimal multiplication — 1-digit × 1-digit', apiPath: 'gymdecimals-api',
  adaptiveOnly: true,
  diffLabels: {
    easy: 'Easy — shift ≤ 1 place',
    medium: 'Medium — ≤ 2 places',
    hard: 'Hard — ≤ 3 places',
    extrahard: 'Extra Hard — ≤ 4 places',
  },
  tip: 'Each operand is one non-zero digit (1-9) with a sign and the decimal point moved. Multiply the digits, apply the sign rule, then count decimal places.',
})

export default GymDecimalsApp

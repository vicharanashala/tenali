import { makeMCQuizApp } from '../App.jsx'

const PolyGymApp = makeMCQuizApp({
  title: 'Polynomials Gym', subtitle: 'Arithmetic → monomial algebra (single-digit ×)',
  apiPath: 'polygym-api',
  adaptiveOnly: true,
  diffLabels: {
    easy: 'Easy — signed int × int / two-digit add',
    medium: 'Medium — int × monomial / like-term add',
    hard: 'Hard — monomial × monomial',
    extrahard: 'Extra Hard — squaring & collect like terms',
  },
  tip: 'Every multiplication reduces to two single-digit numbers. Watch the signs and the powers.',
})

export default PolyGymApp

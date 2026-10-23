import { makeMCQuizApp } from '../App.jsx'

const FuncGymApp = makeMCQuizApp({
  title: 'Functions Gym', subtitle: 'Evaluate small polynomials & rationals',
  apiPath: 'funcgym-api',
  adaptiveOnly: true,
  diffLabels: {
    easy: 'Easy — degree 1 (ax + b)',
    medium: 'Medium — degree 2 (ax² + bx + c)',
    hard: 'Hard — degree 3',
    extrahard: 'Extra Hard — (ax + b) ÷ k',
  },
  tip: 'Substitute x and evaluate. Distractors are off by a small slip — sign or off-by-one — so read carefully.',
})

export default FuncGymApp

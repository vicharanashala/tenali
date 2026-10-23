import { makeMCQuizApp } from '../App.jsx'

const LinEqGymApp = makeMCQuizApp({
  title: 'LinearEquations-Gym', subtitle: 'Solve linear equations with integer answers',
  apiPath: 'lineqgym-api',
  adaptiveOnly: true,
  diffLabels: {
    easy: 'Easy — ax + b = 0, |a| ≤ 5',
    medium: 'Medium — ax + b = 0, |a| ≤ 9',
    hard: 'Hard — ax + b = c',
    extrahard: 'Extra Hard — ax + b = cx + d',
  },
  tip: 'Solutions are always whole numbers. The equation is built so you only ever divide by a single-digit number.',
})

export default LinEqGymApp

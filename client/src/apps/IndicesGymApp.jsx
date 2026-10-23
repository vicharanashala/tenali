import { makeMCQuizApp } from '../App.jsx'

const IndicesGymApp = makeMCQuizApp({
  title: 'Indices-Gym', subtitle: 'Apply index laws — multiply, divide, power',
  apiPath: 'indicesgym-api',
  adaptiveOnly: true,
  diffLabels: {
    easy: 'Easy — multiply / divide on one base',
    medium: 'Medium — adds (a^k)^l',
    hard: 'Hard — two bases & chained ops',
    extrahard: 'Extra Hard — power-of-power chains',
  },
  tip: 'Use a^k · a^l = a^(k+l), a^k ÷ a^l = a^(k−l), (a^k)^l = a^(k·l). Distractors swap the wrong rule.',
})

export default IndicesGymApp

import { makeMCQuizApp } from '../App.jsx'

const DotProdGymApp = makeMCQuizApp({
  title: 'DotProducts Gym', subtitle: 'a · b for 2- and 3-tuples (signed digits)',
  apiPath: 'dotprodgym-api',
  adaptiveOnly: true,
  diffLabels: {
    easy: 'Easy — 2D vectors',
    medium: 'Medium — mixed 2D / 3D',
    hard: 'Hard — 3D, components up to ±6',
    extrahard: 'Extra Hard — 3D, components up to ±9',
  },
  tip: 'Multiply each pair of components and add. Watch the signs — most distractors flip exactly one term.',
})

export default DotProdGymApp

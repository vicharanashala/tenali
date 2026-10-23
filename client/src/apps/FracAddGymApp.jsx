import { makeMCQuizApp } from '../App.jsx'

const FracAddGymApp = makeMCQuizApp({
  title: 'Fractions-add-gym', subtitle: 'Add single-digit fractions',
  apiPath: 'fracaddgym-api',
  adaptiveOnly: true,
  diffLabels: {
    easy: 'Easy — same denominator',
    medium: 'Medium — different denominators',
    hard: 'Hard — answers may need simplifying',
    extrahard: 'Extra Hard — signed numerators',
  },
  tip: 'Find a common denominator, add the numerators, then simplify. Distractors include the classic "added across" mistake.',
})

export default FracAddGymApp

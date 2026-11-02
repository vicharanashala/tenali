import { makeQuizApp } from '../App.jsx'

const HcfLcmApp = makeQuizApp({
  title: 'HCF & LCM', subtitle: 'Highest common factor & lowest common multiple', apiPath: 'hcflcm-api', topicKey: 'hcf-and-lcm',
  diffLabels: { easy: 'Easy — HCF', medium: 'Medium — LCM', hard: 'Hard — Three numbers', extrahard: 'Extra Hard — Word problem' },
  placeholders: 'e.g. 60',
})

export default HcfLcmApp

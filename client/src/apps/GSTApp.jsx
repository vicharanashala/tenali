import { makeQuizApp } from '../App.jsx'

const GSTApp = makeQuizApp({
  title: 'GST', subtitle: 'Goods & Services Tax', apiPath: 'gst-api', topicKey: 'gst',
  diffLabels: { easy: 'Easy — GST amount', medium: 'Medium — Total with GST', hard: 'Hard — CGST+SGST', extrahard: 'Extra Hard — Input tax credit' },
  placeholders: 'e.g. 180',
})

export default GSTApp

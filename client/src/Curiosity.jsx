import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_BASE_URL || ''

const extractCustomNumber = (text) => {
  const match = String(text || '').match(/[-+]?\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : null
}

const TEMPLATES = [
  { label: 'Double first number', variation: 'double the first number' },
  { label: 'Double second number', variation: 'double the second number' },
  { label: 'Double both numbers', variation: 'double both numbers' },
  { label: 'Swap numbers', variation: 'swap numbers' },
  { label: 'Add N to first', variation: 'add N to first' },
  { label: 'Multiply second by N', variation: 'multiply second by N' },
  { label: 'Add N to second', variation: 'add N to second' },
  { label: 'Multiply first by N', variation: 'multiply first by N' },
]

const QUAD_TEMPLATES = [
  { label: 'Double a (coefficient of x^2)', variation: 'double a' },
  { label: 'Double b (coefficient of x)', variation: 'double b' },
  { label: 'Double c (constant)', variation: 'double c' },
  { label: 'Double a and b', variation: 'double a and b' },
  { label: 'Add N to a', variation: 'add N to a' },
  { label: 'Multiply b by N', variation: 'multiply b by N' },
  { label: 'Add N to c', variation: 'add N to c' },
]

const getGeometryMeta = (shape, measure) => {
  const meta = {
    rectangle: {
      firstLabel: 'Length',
      secondLabel: 'Width',
      hasSecond: true,
      formulas: { area: 'A = length x width', perimeter: 'P = 2(length + width)' },
    },
    triangle: {
      firstLabel: 'Base',
      secondLabel: 'Height',
      hasSecond: true,
      formulas: { area: 'A = (base x height) / 2' },
    },
    parallelogram: {
      firstLabel: 'Base',
      secondLabel: 'Height',
      hasSecond: true,
      formulas: { area: 'A = base x height' },
    },
    circle: {
      firstLabel: 'Radius',
      hasSecond: false,
      formulas: { area: 'A = pi r^2', circumference: 'C = 2 pi r' },
    },
    cylinder: {
      firstLabel: 'Radius',
      secondLabel: 'Height',
      hasSecond: true,
      formulas: { volume: 'V = pi r^2 h', surface_area: 'SA = 2 pi r(r + h)' },
    },
    cone: {
      firstLabel: 'Radius',
      secondLabel: 'Height',
      hasSecond: true,
      formulas: { volume: 'V = (pi r^2 h) / 3', surface_area: 'SA = pi r(r + l), where l = sqrt(r^2 + h^2)' },
    },
    sphere: {
      firstLabel: 'Radius',
      hasSecond: false,
      formulas: { volume: 'V = (4/3) pi r^3', surface_area: 'SA = 4 pi r^2' },
    },
  }
  const selected = meta[shape] || meta.rectangle
  return { ...selected, formula: selected.formulas[measure] || Object.values(selected.formulas)[0] }
}

const getGeometryTemplates = (meta) => {
  const first = meta.firstLabel.toLowerCase()
  if (!meta.hasSecond) {
    return [
      { label: `Double ${first}`, variation: 'double first dimension' },
      { label: `Halve ${first}`, variation: 'halve first dimension' },
      { label: `Add N to ${first}`, variation: 'add N to first dimension' },
      { label: `Subtract N from ${first}`, variation: 'subtract N from first dimension' },
      { label: `Multiply ${first} by N`, variation: 'multiply first dimension by N' },
    ]
  }

  const second = meta.secondLabel.toLowerCase()
  return [
    { label: `Double ${first}`, variation: 'double first dimension' },
    { label: `Double ${second}`, variation: 'double second dimension' },
    { label: `Double both dimensions`, variation: 'double both dimensions' },
    { label: `Halve both dimensions`, variation: 'halve both dimensions' },
    { label: `Add N to ${first}`, variation: 'add N to first dimension' },
    { label: `Add N to ${second}`, variation: 'add N to second dimension' },
    { label: `Subtract N from ${first}`, variation: 'subtract N from first dimension' },
    { label: `Subtract N from ${second}`, variation: 'subtract N from second dimension' },
    { label: `Multiply ${first} by N`, variation: 'multiply first dimension by N' },
    { label: `Multiply ${second} by N`, variation: 'multiply second dimension by N' },
  ]
}

export default function CuriosityApp({ onBack }) {
  const [type, setType] = useState('basicarith')
  const [a, setA] = useState('8')
  const [b, setB] = useState('5')
  const [op, setOp] = useState('+')
  const [quadA, setQuadA] = useState('2')
  const [quadB, setQuadB] = useState('3')
  const [quadC, setQuadC] = useState('1')
  const [quadX, setQuadX] = useState('2')
  const [opAB, setOpAB] = useState('+')
  const [opBC, setOpBC] = useState('+')
  const [geometryShape, setGeometryShape] = useState('rectangle')
  const [geometryMeasure, setGeometryMeasure] = useState('area')
  const [variation, setVariation] = useState('double the first number')
  const [templateIndex, setTemplateIndex] = useState(0)
  const [variationMode, setVariationMode] = useState('template')
  const [customTarget, setCustomTarget] = useState('first')
  const [customOp, setCustomOp] = useState('double')
  const [customValue, setCustomValue] = useState('2')
  const [nValue, setNValue] = useState('10')
  const [opN1, setOpN1] = useState('')
  const [valN1, setValN1] = useState('')
  const [opD1, setOpD1] = useState('')
  const [valD1, setValD1] = useState('')
  const [opN2, setOpN2] = useState('')
  const [valN2, setValN2] = useState('')
  const [opD2, setOpD2] = useState('')
  const [valD2, setValD2] = useState('')
  const [swapFirst, setSwapFirst] = useState(false)
  const [swapSecond, setSwapSecond] = useState(false)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dragTarget, setDragTarget] = useState(null)
  const [selectedPlayAction, setSelectedPlayAction] = useState('double')

  useEffect(() => {
    const card = document.querySelector('.card')
    if (!card) return
    card.classList.add('card--curiosity')
    return () => { card.classList.remove('card--curiosity') }
  }, [])

  const geometryMeta = getGeometryMeta(geometryShape, geometryMeasure)
  const geometryTemplates = getGeometryTemplates(geometryMeta)
  const templateList = type === 'quadratic' ? QUAD_TEMPLATES : type === 'geometry' ? geometryTemplates : TEMPLATES

  const customTargetOptions = (() => {
    if (type === 'quadratic') {
      return [
        { value: 'a', label: 'a coefficient' },
        { value: 'b', label: 'b coefficient' },
        { value: 'c', label: 'constant c' },
        { value: 'x', label: 'x value' },
      ]
    }
    if (type === 'geometry') {
      const options = [{ value: 'first', label: geometryMeta.firstLabel }]
      if (geometryMeta.hasSecond) options.push({ value: 'second', label: geometryMeta.secondLabel }, { value: 'both', label: 'Both dimensions' })
      return options
    }
    return [
      { value: 'first', label: 'First number' },
      { value: 'second', label: 'Second number' },
      { value: 'both', label: 'Both numbers' },
      { value: 'swap', label: 'Swap numbers' },
    ]
  })()

  const customValueNeeded = !['double', 'halve', 'swap'].includes(customOp)
  const isBasicPlayground = type === 'basicarith'

  const buildCustomVariation = () => {
    const value = String(customValue || '').trim() || '0'
    if (customTarget === 'swap' || customOp === 'swap') return 'swap numbers'
    if (type === 'quadratic') {
      if (customOp === 'double') return `double ${customTarget}`
      if (customOp === 'halve') return `multiply ${customTarget} by 0.5`
      if (customOp === 'add') return `add ${value} to ${customTarget}`
      if (customOp === 'subtract') return `subtract ${value} from ${customTarget}`
      if (customOp === 'multiply') return `multiply ${customTarget} by ${value}`
    }
    const targetText = customTarget === 'both' ? 'both' : customTarget === 'second' ? 'second' : 'first'
    if (customOp === 'double') return `double ${targetText} ${type === 'geometry' ? 'dimension' : 'number'}`
    if (customOp === 'halve') return `halve ${targetText} ${type === 'geometry' ? 'dimension' : 'number'}`
    if (customOp === 'add') return `add ${value} to ${targetText}`
    if (customOp === 'subtract') return `subtract ${value} from ${targetText}`
    if (customOp === 'multiply') return `multiply ${targetText} by ${value}`
    return variation
  }

  const activeVariation = isBasicPlayground || (type !== 'fraction' && variationMode === 'custom') ? buildCustomVariation() : variation

  const choosePlayVariation = (target, action) => {
    setCustomTarget(target)
    setCustomOp(action)
    setVariationMode('custom')
    setResult(null)
  }

  const handlePlayDragStart = (action, e) => {
    setDragTarget(action)
    setSelectedPlayAction(action)
    setCustomOp(action)
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy'
      e.dataTransfer.setData('text/plain', action)
    }
  }

  const handlePlayDrop = (target, e) => {
    e.preventDefault()
    const action = e.dataTransfer?.getData('text/plain') || dragTarget || selectedPlayAction || 'double'
    choosePlayVariation(action === 'swap' ? 'swap' : target, action)
    setDragTarget(null)
  }

  const handlePlayTargetClick = (target) => {
    choosePlayVariation(selectedPlayAction === 'swap' ? 'swap' : target, selectedPlayAction)
  }

  const playActions = [
    { action: 'double', label: 'Double', symbol: '2x' },
    { action: 'halve', label: 'Half', symbol: '1/2' },
    { action: 'add', label: 'Add', symbol: '+' },
    { action: 'subtract', label: 'Take away', symbol: '-' },
    { action: 'multiply', label: 'Groups of', symbol: 'x' },
    { action: 'swap', label: 'Swap', symbol: '<>' },
  ]

  useEffect(() => {
    if (type === 'fraction') return
    if (!customTargetOptions.some(option => option.value === customTarget)) {
      setCustomTarget(customTargetOptions[0]?.value || 'first')
    }
  }, [type, geometryShape, geometryMeasure, customTarget])

  const buildOriginalData = () => {
    if (type === 'basicarith') return { a: Number(a), b: Number(b), op }
    if (type === 'quadratic') return { a: Number(quadA), b: Number(quadB), c: Number(quadC), x: Number(quadX), opAB, opBC }
    if (type === 'multiply') return { table: Number(a), multiplier: Number(b) }
    if (type === 'fraction') return { n1: Number(quadA), d1: Number(quadB), n2: Number(quadC), d2: Number(quadX), op }
    if (type === 'geometry') return { shape: geometryShape, measure: geometryMeasure, a: Number(a), b: Number(b) }
    return {}
  }

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setBusy(true)
    setResult(null)
    const originalData = buildOriginalData()
    let v = activeVariation

    if (type === 'fraction') {
      const descriptions = []
      const pushDescription = (opSym, prefix, val) => {
        if (!opSym || val == null || String(val).trim() === '') return
        const clean = String(val).trim()
        if (opSym === '*') descriptions.push(`multiply ${prefix} ${clean}`)
        else if (opSym === '+') descriptions.push(`add to ${prefix} ${clean}`)
        else if (opSym === '-') descriptions.push(`subtract from ${prefix} ${clean}`)
      }
      pushDescription(opN1, 'first numerator by', valN1)
      pushDescription(opD1, 'first denominator by', valD1)
      pushDescription(opN2, 'second numerator by', valN2)
      pushDescription(opD2, 'second denominator by', valD2)
      if (swapFirst) descriptions.push('invert first fraction')
      if (swapSecond) descriptions.push('invert second fraction')
      v = descriptions.length ? descriptions.join('; ') : 'manual edits'
    } else if (v.includes('N')) {
      v = v.replace(/N/g, nValue)
    }

    const ops = []
    if (type === 'fraction') {
      const pushOpObj = (opSym, target, val) => {
        if (!opSym || val == null || String(val).trim() === '') return
        const value = Number(String(val).trim())
        if (isNaN(value)) return
        const opType = opSym === '*' ? 'multiply' : opSym === '+' ? 'add' : opSym === '-' ? 'subtract' : null
        if (opType) ops.push({ type: opType, target, value })
      }
      pushOpObj(opN1, 'firstNumerator', valN1)
      pushOpObj(opD1, 'firstDenominator', valD1)
      pushOpObj(opN2, 'secondNumerator', valN2)
      pushOpObj(opD2, 'secondDenominator', valD2)
      if (swapFirst) ops.push({ type: 'invert', target: 'first' })
      if (swapSecond) ops.push({ type: 'invert', target: 'second' })
    }

    if (type === 'quadratic') {
      const vlow = String(v || '').toLowerCase()
      const pushQuad = (target, opType, value) => ops.push({ type: opType, target, value })
      const n = extractCustomNumber(v)
      const mentionedTargets = ['a', 'b', 'c', 'x'].filter(target => vlow.match(new RegExp(`\\b${target}\\b`)))
      if (vlow.includes('double')) {
        if (vlow.match(/\ba\b/) || vlow.match(/\bfirst\b/) || vlow.match(/coefficient/)) pushQuad('a', 'multiply', 2)
        else if (vlow.match(/\bb\b/) || vlow.match(/\bsecond\b/)) pushQuad('b', 'multiply', 2)
        else if (vlow.match(/\bc\b/) || vlow.match(/\bconstant\b/)) pushQuad('c', 'multiply', 2)
        else if (vlow.match(/\bx\b/)) pushQuad('x', 'multiply', 2)
      }
      if (vlow.includes('halve')) mentionedTargets.forEach(target => pushQuad(target, 'multiply', 0.5))
      if (vlow.includes('multiply') && n !== null) mentionedTargets.forEach(target => pushQuad(target, 'multiply', n))
      if (vlow.includes('add') && n !== null) mentionedTargets.forEach(target => pushQuad(target, 'add', n))
      if (vlow.includes('subtract') && n !== null) mentionedTargets.forEach(target => pushQuad(target, 'subtract', n))
    }

    try {
      const variationToSend = type === 'fraction' && ops.length ? '' : v
      const payload = { originalType: type, originalData, variation: variationToSend, ops }
      if (type === 'quadratic') {
        payload.opAB = opAB
        payload.opBC = opBC
      }
      const response = await fetch(`${API}/curiosity-api/variation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      let data
      try {
        data = await response.json()
      } catch {
        const text = await response.clone().text()
        data = { error: `Invalid JSON response: ${text}` }
      }
      setResult(data)
    } catch (err) {
      setResult({ error: err.message || String(err) })
    } finally {
      setBusy(false)
    }
  }

  const changeType = (nextType) => {
    setType(nextType)
    setTemplateIndex(0)
    const list = nextType === 'quadratic'
      ? QUAD_TEMPLATES
      : nextType === 'geometry'
        ? getGeometryTemplates(getGeometryMeta(geometryShape, geometryMeasure))
        : TEMPLATES
    setVariation(list[0].variation)
  }

  const changeGeometryShape = (nextShape) => {
    let nextMeasure = 'area'
    setGeometryShape(nextShape)
    if (nextShape === 'rectangle' || nextShape === 'circle') nextMeasure = 'area'
    else if (nextShape === 'cylinder' || nextShape === 'sphere' || nextShape === 'cone') nextMeasure = 'volume'
    setGeometryMeasure(nextMeasure)
    setTemplateIndex(0)
    setVariation(getGeometryTemplates(getGeometryMeta(nextShape, nextMeasure))[0].variation)
  }

  const originalData = buildOriginalData()
  const originalText = type === 'fraction'
    ? `${originalData.n1}/${originalData.d1} ${originalData.op || op} ${originalData.n2}/${originalData.d2}`
    : type === 'quadratic'
      ? `${originalData.a}x^2 ${opAB} ${originalData.b}x ${opBC} ${originalData.c}, x = ${originalData.x}`
      : type === 'geometry'
        ? `${geometryShape} ${geometryMeasure}: ${geometryMeta.firstLabel.toLowerCase()} ${originalData.a}${geometryMeta.hasSecond ? `, ${geometryMeta.secondLabel.toLowerCase()} ${originalData.b}` : ''}`
        : `${originalData.a} ${originalData.op} ${originalData.b}`
  const previewVariation = result && result.variation ? result.variation : activeVariation.replace(/N/g, nValue)

  const formatAnswer = (answer) => {
    if (!answer && answer !== 0) return String(answer)
    if (answer && typeof answer === 'object' && answer.numerator != null && answer.denominator != null) {
      const gcd = (x, y) => y ? gcd(y, x % y) : Math.abs(x)
      const n = Number(answer.numerator)
      const d = Number(answer.denominator)
      if (isNaN(n) || isNaN(d) || d === 0) return `${n}/${d}`
      const g = gcd(n, d)
      const sn = n / g
      const sd = d / g
      if (sd === 1) return `${sn} (=${sn.toString()})`
      return `${sn}/${sd} (~ ${(n / d).toFixed(3)})`
    }
    if (answer && typeof answer === 'object' && answer.a != null && answer.b != null) return `${answer.a} : ${answer.b}`
    if (answer && typeof answer === 'object') return JSON.stringify(answer)
    return String(answer)
  }

  const round2 = (value) => Math.round(Number(value) * 100) / 100

  const computeOriginalAnswer = () => {
    if (type === 'basicarith') {
      const x = Number(originalData.a)
      const y = Number(originalData.b)
      if (originalData.op === '+') return x + y
      if (originalData.op === '-') return x - y
      if (originalData.op === '*') return x * y
      if (originalData.op === '/') return y === 0 ? null : round2(x / y)
    }
    if (type === 'quadratic') {
      const qa = Number(originalData.a)
      const qb = Number(originalData.b)
      const qc = Number(originalData.c)
      const qx = Number(originalData.x)
      const left = qa * qx * qx
      const mid = qb * qx
      const afterMid = originalData.opAB === '-' ? left - mid : left + mid
      return originalData.opBC === '-' ? afterMid - qc : afterMid + qc
    }
    if (type === 'geometry') {
      const x = Number(originalData.a)
      const y = Number(originalData.b)
      if (geometryShape === 'rectangle') return geometryMeasure === 'perimeter' ? round2(2 * (x + y)) : round2(x * y)
      if (geometryShape === 'triangle') return round2((x * y) / 2)
      if (geometryShape === 'parallelogram') return round2(x * y)
      if (geometryShape === 'circle') return geometryMeasure === 'circumference' ? round2(2 * Math.PI * x) : round2(Math.PI * x * x)
      if (geometryShape === 'cylinder') return geometryMeasure === 'surface_area' ? round2(2 * Math.PI * x * (x + y)) : round2(Math.PI * x * x * y)
      if (geometryShape === 'cone') {
        const slantHeight = Math.sqrt(x * x + y * y)
        return geometryMeasure === 'surface_area' ? round2(Math.PI * x * (x + slantHeight)) : round2((Math.PI * x * x * y) / 3)
      }
      if (geometryShape === 'sphere') return geometryMeasure === 'surface_area' ? round2(4 * Math.PI * x * x) : round2((4 / 3) * Math.PI * x * x * x)
    }
    return null
  }

  const getComparisonRows = () => {
    if (!result || result.error || !result.newProblem) return []
    const next = result.newProblem
    const rows = []
    const addRow = (label, before, after) => {
      if (before == null && after == null) return
      rows.push({ label, before: String(before ?? ''), after: String(after ?? ''), changed: String(before ?? '') !== String(after ?? '') })
    }

    if (type === 'basicarith') {
      addRow('First number', originalData.a, next.a)
      addRow('Operator', originalData.op, next.op)
      addRow('Second number', originalData.b, next.b)
    } else if (type === 'quadratic') {
      addRow('a coefficient', originalData.a, next.a)
      addRow('b coefficient', originalData.b, next.b)
      addRow('constant c', originalData.c, next.c)
      addRow('x value', originalData.x, next.x)
    } else if (type === 'geometry') {
      addRow(geometryMeta.firstLabel, originalData.a, next.a ?? next.r)
      if (geometryMeta.hasSecond) addRow(geometryMeta.secondLabel, originalData.b, next.b ?? next.h)
      if (next.l != null) addRow('Slant height', '-', round2(next.l))
    } else if (type === 'fraction') {
      addRow('First fraction', `${originalData.n1}/${originalData.d1}`, `${next.n1}/${next.d1}`)
      addRow('Operator', originalData.op, next.op)
      addRow('Second fraction', `${originalData.n2}/${originalData.d2}`, `${next.n2}/${next.d2}`)
    }

    const beforeAnswer = computeOriginalAnswer()
    if (beforeAnswer !== null) addRow('Answer', beforeAnswer, formatAnswer(result.newAnswer))
    return rows
  }

  const comparisonRows = getComparisonRows()

  const renderGeometryOptions = () => (
    <>
      {geometryShape === 'rectangle' && <>
        <option value="area">Area</option>
        <option value="perimeter">Perimeter</option>
      </>}
      {(geometryShape === 'triangle' || geometryShape === 'parallelogram') && <option value="area">Area</option>}
      {geometryShape === 'circle' && <>
        <option value="area">Area</option>
        <option value="circumference">Circumference</option>
      </>}
      {(geometryShape === 'cylinder' || geometryShape === 'sphere') && <>
        <option value="volume">Volume</option>
        <option value="surface_area">Surface area</option>
      </>}
      {geometryShape === 'cone' && <>
        <option value="volume">Volume</option>
        <option value="surface_area">Surface area</option>
      </>}
    </>
  )

  const editRows = [
    ['First numerator', opN1, setOpN1, valN1, setValN1],
    ['First denominator', opD1, setOpD1, valD1, setValD1],
    ['Second numerator', opN2, setOpN2, valN2, setValN2],
    ['Second denominator', opD2, setOpD2, valD2, setValD2],
  ]

  return (
    <div className="curiosity-shell">
      <div className="curiosity-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <div>
          <p className="curiosity-eyebrow">What-if lab</p>
          <h2>Curiosity Mode</h2>
        </div>
      </div>

      <div className="curiosity-workspace">
        <section className="curiosity-panel curiosity-controls">
          <form onSubmit={submit} className="curiosity-form">
            <label className="curiosity-field curiosity-field--wide">
              <span>Problem type</span>
              <select value={type} onChange={e => changeType(e.target.value)}>
                <option value="basicarith">Basic arithmetic</option>
                <option value="fraction">Fractions</option>
                <option value="geometry">Geometry / mensuration</option>
                <option value="quadratic">Quadratic evaluation</option>
              </select>
            </label>

            {type === 'quadratic' ? (
              <div className="curiosity-equation-row">
                <input value={quadA} onChange={e => setQuadA(e.target.value)} aria-label="Coefficient a" />
                <span>x^2</span>
                <select value={opAB} onChange={e => setOpAB(e.target.value)} aria-label="Operator between a and b">
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>
                <input value={quadB} onChange={e => setQuadB(e.target.value)} aria-label="Coefficient b" />
                <span>x</span>
                <select value={opBC} onChange={e => setOpBC(e.target.value)} aria-label="Operator between b and c">
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>
                <input value={quadC} onChange={e => setQuadC(e.target.value)} aria-label="Constant c" />
                <span>at x =</span>
                <input value={quadX} onChange={e => setQuadX(e.target.value)} aria-label="Value of x" />
              </div>
            ) : type === 'fraction' ? (
              <div className="curiosity-fraction-setup">
                <label className="curiosity-field">
                  <span>Fraction 1</span>
                  <div className="curiosity-inline-inputs">
                    <input value={quadA} onChange={e => setQuadA(e.target.value)} placeholder="n1" />
                    <span>/</span>
                    <input value={quadB} onChange={e => setQuadB(e.target.value)} placeholder="d1" />
                  </div>
                </label>
                <label className="curiosity-field">
                  <span>Fraction 2</span>
                  <div className="curiosity-inline-inputs">
                    <input value={quadC} onChange={e => setQuadC(e.target.value)} placeholder="n2" />
                    <span>/</span>
                    <input value={quadX} onChange={e => setQuadX(e.target.value)} placeholder="d2" />
                  </div>
                </label>
                <label className="curiosity-field curiosity-field--operator">
                  <span>Operator</span>
                  <select value={op} onChange={e => setOp(e.target.value)}>
                    <option value="+">+</option>
                    <option value="-">-</option>
                    <option value="*">x</option>
                    <option value="/">/</option>
                  </select>
                </label>
              </div>
            ) : type === 'geometry' ? (
              <div className="curiosity-subgrid">
                <label className="curiosity-field">
                  <span>Shape</span>
                  <select value={geometryShape} onChange={e => changeGeometryShape(e.target.value)}>
                    <option value="rectangle">Rectangle</option>
                    <option value="triangle">Triangle</option>
                    <option value="parallelogram">Parallelogram</option>
                    <option value="circle">Circle</option>
                    <option value="cylinder">Cylinder</option>
                    <option value="cone">Cone</option>
                    <option value="sphere">Sphere</option>
                  </select>
                </label>
                <label className="curiosity-field">
                  <span>Find</span>
                  <select value={geometryMeasure} onChange={e => setGeometryMeasure(e.target.value)}>
                    {renderGeometryOptions()}
                  </select>
                </label>
                <label className="curiosity-field">
                  <span>{geometryMeta.firstLabel}</span>
                  <input value={a} onChange={e => setA(e.target.value)} />
                </label>
                {geometryMeta.hasSecond && (
                  <label className="curiosity-field">
                    <span>{geometryMeta.secondLabel}</span>
                    <input value={b} onChange={e => setB(e.target.value)} />
                  </label>
                )}
                <div className="curiosity-formula-note">
                  <span>Formula</span>
                  <strong>{geometryMeta.formula}</strong>
                </div>
              </div>
            ) : (
              <div className="curiosity-playground" aria-label="Arithmetic playground">
                <div className="curiosity-play-problem">
                  <label
                    className={customTarget === 'first' && customOp !== 'swap' ? 'curiosity-number-tile is-target' : 'curiosity-number-tile'}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handlePlayDrop('first', e)}
                    title="Drop a symbol here to change the first number"
                  >
                    <span>First</span>
                    <input
                      value={a}
                      onChange={e => { setA(e.target.value); setResult(null) }}
                      onFocus={() => handlePlayTargetClick('first')}
                      aria-label="First number"
                      inputMode="numeric"
                    />
                  </label>

                  <label className="curiosity-operator-select">
                    <span>Operator</span>
                    <select
                      value={op}
                      onChange={e => { setOp(e.target.value); setResult(null) }}
                      aria-label="Choose operator"
                    >
                      <option value="+">+</option>
                      <option value="-">-</option>
                      <option value="*">x</option>
                      <option value="/">/</option>
                    </select>
                  </label>

                  <label
                    className={customTarget === 'second' && customOp !== 'swap' ? 'curiosity-number-tile is-target' : 'curiosity-number-tile'}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handlePlayDrop('second', e)}
                    title="Drop a symbol here to change the second number"
                  >
                    <span>Second</span>
                    <input
                      value={b}
                      onChange={e => { setB(e.target.value); setResult(null) }}
                      onFocus={() => handlePlayTargetClick('second')}
                      aria-label="Second number"
                      inputMode="numeric"
                    />
                  </label>
                </div>

                <div className="curiosity-action-shelf" aria-label="Drag a change onto a number">
                  {playActions.map(item => (
                    <button
                      key={item.action}
                      type="button"
                      draggable
                      className={selectedPlayAction === item.action ? 'curiosity-action-tile is-active' : 'curiosity-action-tile'}
                      onDragStart={e => handlePlayDragStart(item.action, e)}
                      title={`Drag ${item.label.toLowerCase()} onto a number`}
                      aria-label={`Drag ${item.label.toLowerCase()} onto a number`}
                      onClick={() => {
                        setSelectedPlayAction(item.action)
                        setCustomOp(item.action)
                        if (item.action === 'swap') choosePlayVariation('swap', 'swap')
                      }}
                    >
                      <strong>{item.symbol}</strong>
                    </button>
                  ))}
                </div>

                <div className="curiosity-play-bottom">
                  <label className="curiosity-play-value">
                    <span>Change amount</span>
                    <input
                      value={customValue}
                      onChange={e => { setCustomValue(e.target.value); setResult(null) }}
                      disabled={!customValueNeeded}
                      inputMode="numeric"
                    />
                  </label>
                  <button
                    type="button"
                    className={customTarget === 'both' ? 'curiosity-both-drop is-target' : 'curiosity-both-drop'}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handlePlayDrop('both', e)}
                    onClick={() => handlePlayTargetClick('both')}
                  >
                    Both numbers
                  </button>
                </div>

              </div>
            )}

            {type === 'basicarith' ? null : type !== 'fraction' ? (
              <>
                <div className="curiosity-mode-switch" role="group" aria-label="Variation mode">
                  <button
                    className={variationMode === 'template' ? 'curiosity-mode-option is-active' : 'curiosity-mode-option'}
                    type="button"
                    onClick={() => setVariationMode('template')}
                  >
                    Template
                  </button>
                  <button
                    className={variationMode === 'custom' ? 'curiosity-mode-option is-active' : 'curiosity-mode-option'}
                    type="button"
                    onClick={() => setVariationMode('custom')}
                  >
                    Custom
                  </button>
                </div>

                {variationMode === 'template' ? (
                  <>
                    <label className="curiosity-field curiosity-field--wide">
                      <span>Variation</span>
                      <select
                        value={String(templateIndex)}
                        onChange={e => {
                          const idx = Number(e.target.value)
                          setTemplateIndex(idx)
                          setVariation(templateList[idx].variation)
                        }}
                      >
                        {templateList.map((template, idx) => (
                          <option key={template.label} value={String(idx)}>{template.label}</option>
                        ))}
                      </select>
                    </label>
                    <div className="curiosity-subgrid curiosity-subgrid--compact">
                      <label className="curiosity-field">
                        <span>N value</span>
                        <input value={nValue} onChange={e => setNValue(e.target.value)} />
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="curiosity-custom-grid">
                    <label className="curiosity-field">
                      <span>Target</span>
                      <select value={customTarget} onChange={e => setCustomTarget(e.target.value)}>
                        {customTargetOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="curiosity-field">
                      <span>Operation</span>
                      <select value={customOp} onChange={e => setCustomOp(e.target.value)}>
                        <option value="double">Double</option>
                        <option value="halve">Halve</option>
                        <option value="add">Add</option>
                        <option value="subtract">Subtract</option>
                        <option value="multiply">Multiply by</option>
                        {type === 'basicarith' && <option value="swap">Swap</option>}
                      </select>
                    </label>
                    <label className="curiosity-field">
                      <span>Value</span>
                      <input
                        value={customValue}
                        onChange={e => setCustomValue(e.target.value)}
                        disabled={!customValueNeeded}
                        placeholder={customValueNeeded ? 'value' : 'not needed'}
                      />
                    </label>
                    <div className="curiosity-built-variation">
                      <span>Built variation</span>
                      <strong>{activeVariation}</strong>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="curiosity-manual">
                <div className="curiosity-section-title">
                  <span>Manual edits</span>
                  <small>Choose an operator and value for each part. Leave blank to skip.</small>
                </div>
                <div className="curiosity-edit-grid">
                  {editRows.map(([label, opValue, setOpValue, inputValue, setInputValue]) => (
                    <label className="curiosity-edit-row" key={label}>
                      <span>{label}</span>
                      <select value={opValue} onChange={e => setOpValue(e.target.value)}>
                        <option value="">None</option>
                        <option value="*">x</option>
                        <option value="+">+</option>
                        <option value="-">-</option>
                      </select>
                      <input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="value" />
                    </label>
                  ))}
                </div>
                <div className="curiosity-toggle-row">
                  <button className={swapFirst ? 'curiosity-toggle is-active' : 'curiosity-toggle'} type="button" onClick={() => setSwapFirst(value => !value)}>
                    {swapFirst ? 'First inverted' : 'Invert first'}
                  </button>
                  <button className={swapSecond ? 'curiosity-toggle is-active' : 'curiosity-toggle'} type="button" onClick={() => setSwapSecond(value => !value)}>
                    {swapSecond ? 'Second inverted' : 'Invert second'}
                  </button>
                </div>
              </div>
            )}

            <div className="curiosity-actions">
              <button type="submit" disabled={busy}>{busy ? 'Trying...' : type === 'basicarith' ? 'Show what happens' : 'Generate'}</button>
              <button className="secondary" type="button" onClick={() => { setVariation(''); setResult(null) }}>{type === 'basicarith' ? 'Try again' : 'Clear'}</button>
            </div>
          </form>
        </section>

        <aside className="curiosity-panel curiosity-preview">
          <div className="curiosity-preview-header">
            <span>Preview</span>
            <small>{type}</small>
          </div>
          <div className="curiosity-preview-stack">
            {type === 'basicarith' ? (
              <>
                <div className="curiosity-kid-preview">
                  <div>
                    <span>Start</span>
                    <strong>{originalText}</strong>
                    <small>{formatAnswer(computeOriginalAnswer())}</small>
                  </div>
                  <div>
                    <span>Try</span>
                    <strong>{previewVariation || 'Pick a change'}</strong>
                    <small>{result && !result.error ? formatAnswer(result.newAnswer) : '?'}</small>
                  </div>
                </div>
                <div className="curiosity-result curiosity-result--kid">
                  <span>What happened?</span>
                  {result ? (
                    result.error ? <div className="curiosity-error">{result.error}</div> : (
                      <div className="curiosity-result-body">
                        <div className="curiosity-new-problem">{result.newProblem && result.newProblem.prompt}</div>
                        <div className="curiosity-answer">{formatAnswer(result.newAnswer)}</div>
                        {comparisonRows.length > 0 && (
                          <div className="curiosity-chip-row">
                            {comparisonRows.filter(row => row.changed).map(row => (
                              <span key={row.label}>{row.before} {'->'} {row.after}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  ) : <div className="curiosity-empty">Drag a tile, then try it</div>}
                </div>
              </>
            ) : (
              <>
                <div className="curiosity-preview-item">
                  <span>Original</span>
                  <strong>{originalText}</strong>
                </div>
                <div className="curiosity-preview-item">
                  <span>Variation</span>
                  <strong>{previewVariation || 'No variation selected'}</strong>
                </div>
                {type === 'geometry' && (
                  <div className="curiosity-preview-item">
                    <span>Formula</span>
                    <strong>{geometryMeta.formula}</strong>
                  </div>
                )}
                <div className="curiosity-result">
                  <span>Result</span>
                  {result ? (
                    result.error ? <div className="curiosity-error">{result.error}</div> : (
                      <div className="curiosity-result-body">
                        <div className="curiosity-new-problem">{result.newProblem && result.newProblem.prompt}</div>
                        <div className="curiosity-answer">{formatAnswer(result.newAnswer)}</div>
                        {comparisonRows.length > 0 && (
                          <div className="curiosity-comparison">
                            <div className="curiosity-comparison-head">
                              <span>Compare</span>
                              <span>Before</span>
                              <span>After</span>
                            </div>
                            {comparisonRows.map(row => (
                              <div className={row.changed ? 'curiosity-comparison-row is-changed' : 'curiosity-comparison-row'} key={row.label}>
                                <span>{row.label}</span>
                                <strong>{row.before}</strong>
                                <strong>{row.after}</strong>
                              </div>
                            ))}
                          </div>
                        )}
                        {result.explanation && <pre>{result.explanation}</pre>}
                      </div>
                    )
                  ) : <div className="curiosity-empty">No result yet</div>}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

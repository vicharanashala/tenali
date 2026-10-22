/**
 * whyDemos.jsx - the interactive third beat of "Why learn this?".
 *
 * Every one of the 67 topics gets something to look at and something to
 * drag. A sentence can assert that doubling a box holds eight times as
 * much; only a slider makes anyone believe it. The panel runs hook, then
 * "...but how?" for the mechanism, then this.
 *
 * Each demo is a slider plus a visual assembled from whyVisuals.jsx, so
 * they all share one interaction and one look. Registry keys are topic ids
 * from prerequisiteGraph, which is what topicMotivation.json points at.
 */

import { useState } from 'react'
import { Stage, Bars, CellGrid, NumLine, FnPlot, Poly, Dots, INK, SOFT, LINE, A, P, B, G } from './whyVisuals.jsx'

/* -- Scaffold -------------------------------------------------------- */

function SliderDemo({ label, min, max, step = 1, initial, format, suffix, visual }) {
  const [v, setV] = useState(initial)
  // Until the first drag, the slider wiggles under a "Drag me!" hint, so a
  // child sees at once that this part moves.
  const [touched, setTouched] = useState(false)
  const { big, caption } = format(v)
  return (
    <div className={'why-demo' + (touched ? '' : ' is-inviting')}>
      <label className="why-demo-label">{label}: <strong key={v} className="why-demo-value">{v}{suffix || ''}</strong></label>
      {visual && visual(v)}
      <div className="why-demo-slider-wrap">
        {/* Fades out but keeps its space, so the slider never jumps under
            a finger in the middle of the first drag. */}
        <span className={'why-demo-hint' + (touched ? ' is-done' : '')} aria-hidden="true">👆 Drag me!</span>
        <input className="why-demo-slider" type="range" min={min} max={max} step={step}
               value={v} onChange={(e) => { setV(Number(e.target.value)); setTouched(true) }} aria-label={label} />
      </div>
      {/* Keyed on the text so each new result replays the pop-in. */}
      <p key={big} className="why-demo-big">{big}</p>
      {caption && <p className="why-demo-caption">{caption}</p>}
    </div>
  )
}

const f = (n, d = 0) => n.toLocaleString('en-IN', { maximumFractionDigits: d })
const sci = (n) => (n > 1e12 ? n.toExponential(1) : f(n))

function humanTime(s) {
  if (s < 1) return 'under a second'
  if (s < 60) return `${f(s)} seconds`
  if (s < 3600) return `${f(s / 60)} minutes`
  if (s < 86400) return `${f(s / 3600)} hours`
  if (s < 3.15e7) return `${f(s / 86400)} days`
  const y = s / 3.15e7
  if (y < 1e6) return `${f(y)} years`
  if (y < 1e9) return `${f(y / 1e6)} million years`
  return `${f(y / 1e9)} billion years`
}

/* == ARITHMETIC ====================================================== */

const basicarith = () => (
  <SliderDemo label="Split 12 as" min={1} max={11} initial={5}
    visual={(n) => <Bars max={12} h={46} items={[
      { label: `${n}`, value: n, colour: B }, { label: `${12 - n}`, value: 12 - n, colour: P }]} />}
    format={(n) => ({ big: `${n} + ${12 - n} = 12`,
      caption: 'Split 12 any way you like and it is still 12. Here is a trick: 8 + 7 is 8 + 2 + 5. Making 10 first is easy!' })} />
)

const addition = () => (
  <SliderDemo label="Add to 28" min={1} max={9} initial={7}
    visual={(n) => <Bars max={40} h={46} items={[
      { label: '28', value: 28, colour: B }, { label: `+${n}`, value: n, colour: 28 + n >= 30 ? A : P },
      { label: '=', value: 28 + n, display: 28 + n, colour: G }]} />}
    format={(n) => ({ big: `28 + ${n} = ${28 + n}`,
      caption: 28 + n >= 30 ? `The ones column went past 9! ${n} splits into ${30 - 28} to make the next ten, with ${n - 2} left over. That is carrying.`
        : 'The ones column still has room, so nothing carries yet. Slide it higher!' })} />
)

const multiply = () => (
  <SliderDemo label="Columns" min={1} max={12} initial={8}
    visual={(n) => <CellGrid rows={7} cols={n} h={80} fill={(r, c) => (c < 4 ? B : P)} />}
    format={(n) => ({ big: `7 x ${n} = ${7 * n}`,
      caption: `Split the block: 7 x 4 is ${28}, and 7 x ${n - 4 > 0 ? n - 4 : 0} is ${7 * Math.max(0, n - 4)}. Together that makes ${7 * n}. Splitting into easy pieces is the trick!` })} />
)

const rounding = () => (
  <SliderDemo label="Number" min={40} max={50} step={0.5} initial={44.5}
    visual={(n) => <NumLine min={40} max={50} ticks={2} h={54}
      marks={[{ at: n, label: String(n), colour: A }, { at: 45, colour: LINE }]} />}
    format={(n) => ({ big: `Rounds to ${n >= 45 ? 50 : 40}`,
      caption: n === 45 ? 'Exactly halfway! The rule says round up, so everyone gets the same answer.'
        : `${n} is nearer ${n >= 45 ? 50 : 40}. The digit after the cut tells you which side of 45 you are on.` })} />
)

const fractionadd = () => (
  <SliderDemo label="Add 1/2 and 1/n where n =" min={2} max={9} initial={3}
    visual={(n) => <Bars max={1} h={70} items={[
      { label: '1/2', value: 0.5, display: '1/2', colour: B },
      { label: `1/${n}`, value: 1 / n, display: `1/${n}`, colour: P },
      { label: 'total', value: 0.5 + 1 / n, display: `${n + 2}/${2 * n}`, colour: G }]} />}
    format={(n) => ({ big: `1/2 + 1/${n} = ${n + 2}/${2 * n}`,
      caption: `Not ${2}/${2 + n}! Cut both into ${2 * n}ths first, so the slices are the same size. Then just add them.` })} />
)

const percent = () => (
  <SliderDemo label="Second discount, after 50% off" min={0} max={50} step={5} initial={20} suffix="%"
    visual={(p) => <Bars max={2400} h={70} items={[
      { label: 'sticker', value: 2400, display: '2400', colour: LINE },
      { label: 'after 50%', value: 1200, display: '1200', colour: B },
      { label: `then ${p}%`, value: 1200 * (1 - p / 100), display: f(1200 * (1 - p / 100)), colour: A }]} />}
    format={(p) => ({ big: `You pay Rs ${f(1200 * (1 - p / 100))}`,
      caption: `Sounds like ${50 + p}% off. It is ${Math.round((1 - (1200 * (1 - p / 100)) / 2400) * 100)}%, because the second discount comes off the price that is left.` })} />
)

const profitloss = () => (
  <SliderDemo label="Markup on a Rs 100 item" min={0} max={100} step={10} initial={50} suffix="%"
    visual={(m) => <Bars max={200} h={70} items={[
      { label: 'cost', value: 100, display: '100', colour: LINE },
      { label: 'marked', value: 100 + m, display: f(100 + m), colour: B },
      { label: 'after 30% off', value: (100 + m) * 0.7, display: f((100 + m) * 0.7), colour: (100 + m) * 0.7 >= 100 ? G : '#c0504d' }]} />}
    format={(m) => {
      const s = (100 + m) * 0.7
      return { big: s >= 100 ? `Still Rs ${f(s - 100)} profit` : `Loss of Rs ${f(100 - s)}`,
        caption: 'The markup is taken from the cost. The discount is taken from the marked price. Different starting numbers, so the shop still makes money!' }
    }} />
)

const ratio = () => (
  <SliderDemo label="Guests" min={1} max={24} initial={4}
    visual={(n) => { const k = n / 4; return <Bars max={12} h={70} items={[
      { label: 'rice', value: 2 * k, display: f(2 * k, 1), colour: A },
      { label: 'water', value: 3 * k, display: f(3 * k, 1), colour: B },
      { label: 'salt', value: 0.5 * k, display: f(0.5 * k, 2), colour: P }]} /> }}
    format={(n) => ({ big: `Everything x ${f(n / 4, 2)}`,
      caption: 'Every bar is multiplied by the same number. Add one extra cup to each instead and the rice turns to mush!' })} />
)

const sdt = () => (
  <SliderDemo label="Average speed" min={20} max={120} step={5} initial={60} suffix=" km/h"
    visual={(v) => <FnPlot h={84} xMin={20} xMax={120} yMin={0} yMax={12}
      fns={[{ f: (x) => 240 / x, colour: A }]} points={[{ x: v, y: 240 / v, colour: P }]} />}
    format={(v) => { const t = 240 / v; return {
      big: `240 km takes ${Math.floor(t)}h ${Math.round((t - Math.floor(t)) * 60)}m`,
      caption: 'The curve flattens out. Going 40 to 80 saves 3 hours, but 80 to 120 saves only 1. Each extra bit of speed helps less.' } }} />
)

const squaring = () => (
  <SliderDemo label="Side" min={1} max={9} initial={5}
    visual={(n) => <CellGrid rows={n} cols={n} h={84} cell={9}
      fill={(r, c) => (r === n - 1 || c === n - 1 ? A : B)} />}
    format={(n) => ({ big: `${n}² = ${n * n}, and ${n - 1}² was ${(n - 1) * (n - 1)}`,
      caption: `The orange L is the new part: ${n - 1} along, ${n - 1} up, plus 1 corner. That is ${2 * n - 1}, always an odd number!` })} />
)

const decimals = () => (
  <SliderDemo label="Sixteenths filled" min={1} max={16} initial={12}
    visual={(n) => <CellGrid rows={1} cols={16} h={40} cell={11} fill={(r, c) => (c < n ? A : LINE)} />}
    format={(n) => ({ big: `${n}/16 = ${n / 16}`,
      caption: '16 is made only of 2s, so these decimals all stop neatly. Thirds never stop, because 3 does not go into 10.' })} />
)

const shares = () => (
  <SliderDemo label="First it falls by" min={10} max={80} step={10} initial={50} suffix="%"
    visual={(d) => { const low = 100 - d; return <Bars max={100} h={70} items={[
      { label: 'start', value: 100, display: '100', colour: LINE },
      { label: `-${d}%`, value: low, display: f(low), colour: '#c0504d' },
      { label: `then +${d}%`, value: low * (1 + d / 100), display: f(low * (1 + d / 100)), colour: B }]} /> }}
    format={(d) => { const back = (100 - d) * (1 + d / 100); return {
      big: `Back to only ${f(back, 1)}`,
      caption: `A ${d}% rise on a smaller number is a smaller rise. To undo a ${d}% fall you need ${f((100 / (100 - d) - 1) * 100)}%, not ${d}%.` } }} />
)

const banking = () => (
  <SliderDemo label="Month of deposit" min={1} max={12} initial={1}
    visual={(m) => <Bars max={12} h={62} items={[
      { label: `month ${m}`, value: 13 - m, display: `${13 - m} months of growth`, colour: A },
      { label: 'month 12', value: 1, display: '1 month', colour: LINE }]} />}
    format={(m) => ({ big: `Deposit ${m} earns for ${13 - m} months`,
      caption: 'Each deposit grows for a different number of months. The final amount is all twelve added up. The RD formula is a shortcut for that.' })} />
)

const gst = () => (
  <SliderDemo label="Price before tax" min={100} max={1000} step={50} initial={100} suffix=" Rs"
    visual={(p) => <Bars max={1180} h={62} items={[
      { label: 'base', value: p, display: f(p), colour: B },
      { label: '+18% GST', value: p * 1.18, display: f(p * 1.18), colour: A }]} />}
    format={(p) => ({ big: `Bill: Rs ${f(p * 1.18)}, tax inside: Rs ${f(p * 0.18)}`,
      caption: `To take the tax out, divide by 1.18. Do not take 18% off! 18% of ${f(p * 1.18)} is ${f(p * 1.18 * 0.18)}, which is wrong.` })} />
)

/* == NUMBER THEORY =================================================== */

const hcflcm = () => (
  <SliderDemo label="Second gear teeth" min={2} max={16} initial={12}
    visual={(n) => <NumLine min={0} max={100} ticks={4} h={60}
      marks={[...Array(Math.floor(100 / 8)).keys()].map((i) => ({ at: (i + 1) * 8, colour: B }))
        .concat([...Array(Math.floor(100 / n)).keys()].map((i) => ({ at: (i + 1) * n, colour: P })))} />}
    format={(n) => { let l = 8; while (l % n !== 0) l += 8; return {
      big: `They realign after ${l} teeth`,
      caption: `8 x ${n} = ${8 * n} also works, but ${l} is the first time. Waiting for two buses? The first time is the one you want!` } }} />
)

const primefactor = () => (
  <SliderDemo label="Digits in the number" min={4} max={40} step={2} initial={12}
    visual={(d) => <Bars max={20} h={46} items={[
      { label: 'multiply', value: 1, display: '1 step', colour: G },
      { label: 'factor back', value: Math.min(20, d / 2), display: `${Math.pow(10, d / 2).toExponential(0)} tries`, colour: '#c0504d' }]} />}
    format={(d) => ({ big: `About ${humanTime(Math.pow(10, d / 2) / 1e9)} to reverse`,
      caption: 'Multiplying is one quick step. Finding the primes again is a slow hunt with no clues. That is what keeps your bank safe.' })} />
)

const bases = () => (
  <SliderDemo label="Number" min={0} max={255} initial={73}
    visual={(n) => { const bits = n.toString(2).padStart(8, '0').split('')
      return <CellGrid rows={1} cols={8} h={40} cell={13} fill={(r, c) => (bits[c] === '1' ? A : LINE)} /> }}
    format={(n) => { const bits = n.toString(2).padStart(8, '0')
      const on = bits.split('').map((b, i) => (b === '1' ? Math.pow(2, 7 - i) : null)).filter(Boolean)
      return { big: `${n} = ${bits}`,
        caption: `Lit switches: ${on.join(' + ')} = ${n}. Each column is worth double the one on its right. That is all binary is!` } }} />
)

/* == ALGEBRA ========================================================= */

const sqrt = () => (
  <SliderDemo label="Floor area" min={4} max={144} step={4} initial={36} suffix=" sq m"
    visual={(a) => { const s = Math.round(Math.sqrt(a)); return <CellGrid rows={s} cols={s} h={84} fill={() => B} /> }}
    format={(a) => ({ big: `A square room ${f(Math.sqrt(a), 2)} m a side`,
      caption: '4 times the area gives only 2 times the width. So a room twice as big does not feel twice as wide.' })} />
)

const indices = () => (
  <SliderDemo label="Times you fold the paper" min={0} max={42} initial={10}
    visual={(n) => <FnPlot h={80} xMin={0} xMax={42} yMin={0} yMax={42} axes
      fns={[{ f: (x) => Math.log2(0.1 * Math.pow(2, x)), colour: A }]}
      points={[{ x: n, y: Math.log2(0.1 * Math.pow(2, n)), colour: P }]} />}
    format={(n) => { const km = (0.1 * Math.pow(2, n)) / 1e6; return {
      big: km >= 1 ? `${f(km)} km thick` : `${f(0.1 * Math.pow(2, n), 2)} mm thick`,
      caption: km >= 384400 ? 'Past the moon, from one sheet of paper! The graph is squashed, or the line would shoot off the screen.'
        : 'Even on a squashed graph, the line keeps climbing. Doubling always wins in the end!' } }} />
)

const surds = () => (
  <SliderDemo label="Decimal places used" min={1} max={8} initial={3}
    visual={(d) => { const r = Number(Math.sqrt(2).toFixed(d))
      return <NumLine min={1.4} max={1.45} ticks={2} h={54}
        marks={[{ at: Math.SQRT2, label: 'root 2', colour: A }, { at: r, label: String(r), colour: P }]} /> }}
    format={(d) => { const r = Number(Math.sqrt(2).toFixed(d))
      return { big: `Error after 1000 steps: ${f(Math.abs(Math.SQRT2 - r) * 1000, 4)}`,
        caption: 'The digits of √2 never stop, however many you write. Keeping √2 as it is keeps your answer exact.' } }} />
)

const stdform = () => (
  <SliderDemo label="Power of ten" min={-9} max={26} initial={9}
    visual={(p) => <NumLine min={-9} max={26} ticks={5} h={54} marks={[{ at: p, label: `10^${p}`, colour: A }]} />}
    format={(p) => { const things = [[-9, 'a virus'], [-3, 'a grain of sand'], [0, 'you'], [3, 'a hill'], [6, 'the Earth across'], [9, 'the Sun across'], [20, 'the galaxy'], [26, 'the visible universe']]
      const near = things.reduce((a, b) => (Math.abs(b[0] - p) < Math.abs(a[0] - p) ? b : a))
      return { big: `10^${p} metres, roughly ${near[1]}`,
        caption: '10^26 takes just a few characters. Written out it takes 27 digits, which nobody can read at a glance!' } }} />
)

const log = () => (
  <SliderDemo label="Earthquake magnitude" min={4} max={9} initial={6}
    visual={(m) => <Bars max={5} h={62} items={[
      { label: 'magnitude 4', value: 1, display: '1x', colour: LINE },
      { label: `magnitude ${m}`, value: m - 3, display: `${f(Math.pow(10, m - 4))}x`, colour: A }]} />}
    format={(m) => ({ big: `${f(Math.pow(10, m - 4))}x the ground movement of a 4`,
      caption: 'The bar grows one step at a time, but the number underneath gets ten times bigger each step. A log scale squashes huge numbers to fit.' })} />
)

const quadratic = () => (
  <SliderDemo label="a in y = ax²" min={-3} max={3} step={0.5} initial={1}
    visual={(a) => <FnPlot h={88} xMin={-5} xMax={5} yMin={-8} yMax={8} fns={[{ f: (x) => a * x * x, colour: A }]} />}
    format={(a) => ({ big: a === 0 ? 'a = 0 gives a flat line' : `y = ${a}x²`,
      caption: a < 0 ? 'A negative a makes it open downward, like a frown. That is the path of a thrown ball!'
        : 'A positive a opens it upward, like a smile. A bigger a makes it narrower. Slide below zero for a thrown ball!' })} />
)

const funceval = () => (
  <SliderDemo label="Input x" min={-4} max={6} initial={3}
    visual={(x) => <FnPlot h={84} xMin={-4} xMax={6} yMin={-4} yMax={22}
      fns={[{ f: (t) => t * t - 2 * t + 1, colour: A }]}
      points={[{ x, y: x * x - 2 * x + 1, colour: P, label: `f(${x})` }]}
      segs={[{ x1: x, y1: -4, x2: x, y2: x * x - 2 * x + 1, colour: LINE, dashed: true }]} />}
    format={(x) => ({ big: `f(${x}) = ${x * x - 2 * x + 1}`,
      caption: `f(x) = x² - 2x + 1. Put ${x} everywhere x appears, then work it out. f(${x}) means "put ${x} in", not f times ${x}.` })} />
)

const polymul = () => (
  <SliderDemo label="b in (a+b)²  with a = 4" min={1} max={7} initial={3}
    visual={(b) => { const t = 4 + b
      return <CellGrid rows={t} cols={t} h={84} cell={8}
        fill={(r, c) => (r < 4 && c < 4 ? B : r >= 4 && c >= 4 ? P : A)} /> }}
    format={(b) => ({ big: `(4+${b})² = 16 + ${8 * b} + ${b * b} = ${(4 + b) * (4 + b)}`,
      caption: `The orange strips are the 2ab everyone forgets. Blue is a², purple is b². Leave out the orange and you are ${8 * b} short.` })} />
)

const polyfactor = () => (
  <SliderDemo label="Second root" min={1} max={8} initial={3}
    visual={(q) => <FnPlot h={84} xMin={-1} xMax={9} yMin={-6} yMax={10}
      fns={[{ f: (x) => (x - 2) * (x - q), colour: A }]}
      points={[{ x: 2, y: 0, colour: P }, { x: q, y: 0, colour: P }]} />}
    format={(q) => ({ big: `(x-2)(x-${q}) = x² ${-(2 + q) >= 0 ? '+' : ''}${-(2 + q)}x + ${2 * q}`,
      caption: `The curve crosses zero right where a bracket is zero. Two things multiply to zero only if one of them is zero!` })} />
)

const qformula = () => (
  <SliderDemo label="c in x² - 4x + c" min={0} max={8} initial={3}
    visual={(c) => <FnPlot h={84} xMin={-2} xMax={6} yMin={-6} yMax={10}
      fns={[{ f: (x) => x * x - 4 * x + c, colour: A }]} />}
    format={(c) => { const d = 16 - 4 * c; return {
      big: `b² - 4ac = ${d}`,
      caption: d > 0 ? 'Positive! The curve crosses the axis twice, so there are two answers.'
        : d === 0 ? 'Exactly zero! The curve just touches the axis, so there is one answer.'
        : 'Negative! The curve never reaches the axis, so there are no real answers.' } }} />
)

const simul = () => (
  <SliderDemo label="Gradient of the second line" min={-3} max={3} step={0.5} initial={-1}
    visual={(m) => <FnPlot h={84} xMin={-5} xMax={5} yMin={-6} yMax={6}
      fns={[{ f: (x) => 2 * x + 1, colour: B }, { f: (x) => m * x - 1, colour: P }]}
      points={m === 2 ? [] : [{ x: -2 / (m - 2), y: 2 * (-2 / (m - 2)) + 1, colour: A }]} />}
    format={(m) => ({ big: m === 2 ? 'Parallel: no solution' : `They cross once`,
      caption: m === 2 ? 'Same slope, so the lines never meet. No answer at all! The algebra gives nonsense like 0 = 2.'
        : 'Solving two equations means finding where two lines cross. One crossing, one answer.' })} />
)

const ineq = () => (
  <SliderDemo label="Multiply both sides by" min={-3} max={3} initial={-1}
    visual={(k) => <NumLine min={-10} max={10} ticks={4} h={54}
      marks={[{ at: -2 * k, label: String(-2 * k), colour: B }, { at: 3 * k, label: String(3 * k), colour: P }]} />}
    format={(k) => ({ big: k < 0 ? `${-2 * k} > ${3 * k}` : k === 0 ? '0 = 0' : `${-2 * k} < ${3 * k}`,
      caption: k < 0 ? 'Multiplying by a negative flipped the number line like a mirror. The smaller one is now on the right, so the sign must flip!'
        : 'Multiplying by a positive keeps the order. Drag below zero and watch them swap!' })} />
)

const sequences = () => (
  <SliderDemo label="Days" min={1} max={20} initial={10}
    visual={(n) => <Bars max={Math.max(100, Math.pow(2, n - 1))} h={46} items={[
      { label: 'add 5', value: 5 * n, display: f(5 * n), colour: B },
      { label: 'double', value: Math.pow(2, n - 1), display: f(Math.pow(2, n - 1)), colour: A }]} />}
    format={(n) => ({ big: `Adding: ${f(5 * n)}   Doubling: ${f(Math.pow(2, n - 1))}`,
      caption: n < 6 ? 'At first, adding is ahead. Keep dragging!' : 'The blue bar has almost vanished! Doubling has left adding far behind.' })} />
)

const variation = () => (
  <SliderDemo label="Workers" min={1} max={12} initial={6}
    visual={(w) => <FnPlot h={84} xMin={1} xMax={12} yMin={0} yMax={60}
      fns={[{ f: (x) => 60 / x, colour: A }]} points={[{ x: w, y: 60 / w, colour: P }]} />}
    format={(w) => ({ big: `${w} workers take ${f(60 / w, 1)} days`,
      caption: 'Workers × days always makes 60. Double the workers and the days halve, but only if the job can be shared out!' })} />
)

const binomial = () => (
  <SliderDemo label="Row of Pascal's triangle" min={0} max={7} initial={4}
    visual={(n) => { const row = []; let c = 1
      for (let i = 0; i <= n; i++) { row.push(c); c = (c * (n - i)) / (i + 1) }
      return <Stage h={44} label="Pascal row">
        {row.map((v, i) => (
          <text key={i} x={100 - (row.length * 22) / 2 + 11 + i * 22} y="26" fontSize="11"
                fill={i === Math.floor(row.length / 2) ? A : SOFT} textAnchor="middle" fontWeight="700">{v}</text>
        ))}
      </Stage> }}
    format={(n) => ({ big: `(a+b)^${n} coefficients`,
      caption: 'These numbers also count how many ways you can choose things. Two different questions, one set of answers!' })} />
)

const complex = () => (
  <SliderDemo label="Multiply by i this many times" min={0} max={4} initial={1}
    visual={(k) => { const pts = [[3, 1], [-1, 3], [-3, -1], [1, -3]][k % 4]
      return <FnPlot h={84} xMin={-5} xMax={5} yMin={-5} yMax={5} fns={[]}
        segs={[{ x1: 0, y1: 0, x2: pts[0], y2: pts[1], colour: A }]}
        points={[{ x: pts[0], y: pts[1], colour: A, label: `${pts[0]}${pts[1] >= 0 ? '+' : ''}${pts[1]}i` }]} /> }}
    format={(k) => ({ big: `Rotated ${k * 90}°`,
      caption: 'Multiplying by i turns a number a quarter turn. Do it four times and you are back home, so i⁴ = 1!' })} />
)

const bounds = () => (
  <SliderDemo label="Measured length, to nearest cm" min={5} max={20} initial={12} suffix=" cm"
    visual={(n) => <NumLine min={n - 2} max={n + 2} ticks={4} h={54}
      regions={[{ from: n - 0.5, to: n + 0.5, colour: A }]} marks={[{ at: n, label: String(n), colour: A }]} />}
    format={(n) => ({ big: `Really between ${n - 0.5} and ${n + 0.5}`,
      caption: `Square it to get an area and it could be anywhere from ${f((n - 0.5) * (n - 0.5), 2)} to ${f((n + 0.5) * (n + 0.5), 2)}. The wobble grew bigger!` })} />
)

const lineareq = () => (
  <SliderDemo label="Subtract from both sides" min={0} max={7} initial={0}
    visual={(k) => <Bars max={20} h={46} items={[
      { label: '2x + 7', value: 13 - k, display: `2x + ${7 - k}`, colour: B },
      { label: '13', value: 13 - k, display: String(13 - k), colour: P }]} />}
    format={(k) => ({ big: k === 7 ? '2x = 6, so x = 3' : `2x + ${7 - k} = ${13 - k}`,
      caption: 'Both sides stay level, because whatever you take from one side you take from the other. Take 7 off both and x is nearly alone!' })} />
)

const linprog = () => (
  <SliderDemo label="Budget limit" min={4} max={10} initial={7}
    visual={(c) => <FnPlot h={84} xMin={0} xMax={10} yMin={0} yMax={10}
      fns={[{ f: (x) => c - x, colour: B }, { f: () => 5, colour: P, dashed: true }]}
      points={[{ x: 0, y: 0, colour: A }, { x: Math.min(c, 10), y: 0, colour: A },
               { x: 0, y: Math.min(c, 5), colour: A }, { x: Math.max(0, c - 5), y: Math.min(c, 5), colour: A }]} />}
    format={(c) => {
      // Maximise 3x + 2y over the corners of the feasible region.
      const corners = [[0, 0], [Math.min(c, 10), 0], [0, Math.min(c, 5)], [Math.max(0, c - 5), Math.min(c, 5)]]
      const best = corners.reduce((a, b) => (3 * b[0] + 2 * b[1] > 3 * a[0] + 2 * a[1] ? b : a))
      return {
        big: `Best profit ${f(3 * best[0] + 2 * best[1])}, at corner (${f(best[0], 1)}, ${f(best[1], 1)})`,
        caption: 'The best answer is never in the middle. It is always at a corner, so you only need to check the dots!',
      }
    }} />
)

const remfactor = () => (
  <SliderDemo label="Test x =" min={-3} max={4} initial={2}
    visual={(a) => <FnPlot h={84} xMin={-3} xMax={4} yMin={-10} yMax={10}
      fns={[{ f: (x) => (x - 2) * (x + 1) * 0.8, colour: A }]}
      points={[{ x: a, y: (a - 2) * (a + 1) * 0.8, colour: P }]} />}
    format={(a) => { const r = (a - 2) * (a + 1) * 0.8; return {
      big: `f(${a}) = ${f(r, 1)}`,
      caption: r === 0 ? `Zero! So (x - ${a}) divides it exactly. No long division needed.`
        : 'Not zero, so it does not divide exactly. The number you get is the remainder.' } }} />
)

/* == GEOMETRY ======================================================== */

const angles = () => (
  <SliderDemo label="Drag the ray" min={10} max={170} initial={55} suffix="°"
    visual={(a) => { const rad = (a * Math.PI) / 180
      return <Stage h={84} label="angles on a straight line">
        <line x1="20" y1="70" x2="180" y2="70" stroke={LINE} strokeWidth="2" />
        <line x1="100" y1="70" x2={100 + 60 * Math.cos(Math.PI - rad)} y2={70 - 60 * Math.sin(Math.PI - rad)} stroke={A} strokeWidth="2.5" />
        <path d={`M 72 70 A 28 28 0 0 1 ${100 + 28 * Math.cos(Math.PI - rad)} ${70 - 28 * Math.sin(Math.PI - rad)}`} fill="none" stroke={P} strokeWidth="2" />
        <path d={`M ${100 + 20 * Math.cos(Math.PI - rad)} ${70 - 20 * Math.sin(Math.PI - rad)} A 20 20 0 0 1 120 70`} fill="none" stroke={B} strokeWidth="2" />
        <circle cx="100" cy="70" r="3" fill={INK} />
      </Stage> }}
    format={(a) => ({ big: `${a}° + ${180 - a}° = 180°`,
      caption: 'Move it anywhere. When one angle grows, the other shrinks by the same amount. Measure one and you get the other free!' })} />
)

const triangles = () => (
  <SliderDemo label="Slide the top corner" min={15} max={165} initial={70}
    visual={(t) => { const ax = 30 + (t / 180) * 140
      return <Poly h={84} pts={[[30, 74], [170, 74], [ax, 16]]} dots={[[ax, 16, A]]} /> }}
    format={(t) => { const ax = 30 + (t / 180) * 140
      const ang = (px, py, qx, qy, rx, ry) => { let d = Math.abs((Math.atan2(qy - py, qx - px) - Math.atan2(ry - py, rx - px)) * 180 / Math.PI); return d > 180 ? 360 - d : d }
      const A1 = ang(30, 74, 170, 74, ax, 16), B1 = ang(170, 74, 30, 74, ax, 16)
      return { big: `${f(A1)}° + ${f(B1)}° + ${f(180 - A1 - B1)}° = 180°`,
        caption: 'Squash it, stretch it, make it silly! The three angles always add to 180°. Know two and you can find the third.' } }} />
)

const polygons = () => (
  <SliderDemo label="Sides" min={3} max={12} initial={6}
    visual={(n) => { const pts = [...Array(n).keys()].map((i) => {
      const th = (i / n) * 2 * Math.PI - Math.PI / 2
      return [100 + 32 * Math.cos(th), 44 + 32 * Math.sin(th)] })
      return <Poly h={88} pts={pts} /> }}
    format={(n) => ({ big: `Each turn ${f(360 / n, 1)}°, total 360°`,
      caption: `Walk the edge and you turn ${f(360 / n, 1)}° at every corner. One lap is one full turn, so the outside angles always add to 360°.` })} />
)

const congruence = () => (
  <SliderDemo label="Second triangle's third side" min={3} max={11} initial={7}
    visual={(c) => <Stage h={84} label="two triangles">
      <polygon points="20,74 76,74 44,26" fill="var(--clr-accent-soft)" stroke={B} strokeWidth="2" />
      <polygon points={`110,74 ${110 + c * 8},74 ${134},26`} fill="none" stroke={c === 7 ? G : P} strokeWidth="2" />
    </Stage>}
    format={(c) => ({ big: c === 7 ? 'Congruent: identical' : 'Same shape family, different triangle',
      caption: c === 7 ? 'Three matching sides leave no wiggle room. The triangles are twins!'
        : 'Change one side and it is a different triangle. Matching angles alone would not spot this!' })} />
)

const similarity = () => (
  <SliderDemo label="Scale the photo by" min={1} max={4} step={0.5} initial={2} suffix="x"
    visual={(k) => <CellGrid rows={Math.round(k * 2)} cols={Math.round(k * 2)} h={80}
      fill={(r, c) => (r < 2 && c < 2 ? B : A)} />}
    format={(k) => ({ big: `Sides ${k}x, area ${f(k * k, 2)}x`,
      caption: 'The blue square is the original. A pizza twice as wide is four times the pizza!' })} />
)

const pythag = () => (
  <SliderDemo label="Height of the wall" min={3} max={12} initial={6} suffix=" m"
    visual={(a) => { const h = Math.min(a * 4.5, 54)
      return <Stage h={88} label="right angled triangle">
        <polygon points={`40,76 104,76 40,${76 - h}`} fill="var(--clr-accent-soft)" stroke={A} strokeWidth="2" />
        <rect x="40" y={76 - 10} width="10" height="10" fill="none" stroke={SOFT} strokeWidth="1.5" />
        <text x="72" y="86" fontSize="8" fill={SOFT} textAnchor="middle">8 m</text>
        <text x="30" y={76 - h / 2} fontSize="8" fill={SOFT} textAnchor="middle">{a} m</text>
      </Stage> }}
    format={(a) => ({ big: `Ladder: ${f(Math.sqrt(a * a + 64), 2)} m`,
      caption: `${a}² + 8² = ${a * a + 64}, and its square root is your ladder. No climbing needed to find it!` })} />
)

const circleth = () => (
  <SliderDemo label="Move the point on the edge" min={0} max={100} initial={30}
    visual={(t) => { const th = (t / 100) * Math.PI * 0.9 + Math.PI * 0.05
      const ex = 100 + 34 * Math.cos(Math.PI + th), ey = 46 + 34 * Math.sin(Math.PI + th)
      return <Stage h={92} label="circle theorem">
        <circle cx="100" cy="46" r="34" fill="none" stroke={LINE} strokeWidth="1.5" />
        <line x1="70" y1="62" x2="100" y2="46" stroke={A} strokeWidth="2" />
        <line x1="130" y1="62" x2="100" y2="46" stroke={A} strokeWidth="2" />
        <line x1="70" y1="62" x2={ex} y2={ey} stroke={B} strokeWidth="2" />
        <line x1="130" y1="62" x2={ex} y2={ey} stroke={B} strokeWidth="2" />
        <circle cx="100" cy="46" r="3" fill={A} />
        <circle cx={ex} cy={ey} r="3.5" fill={B} />
      </Stage> }}
    format={() => ({ big: 'Centre angle is always double the edge angle',
      caption: 'Slide the blue point anywhere along the arc. Its angle does not change at all!' })} />
)

const mensur = () => (
  <SliderDemo label="Make every side bigger by" min={1} max={4} step={0.5} initial={2} suffix="x"
    visual={(k) => <Bars max={64} h={62} items={[
      { label: 'surface', value: k * k, display: `${f(k * k, 2)}x`, colour: B },
      { label: 'volume', value: k * k * k, display: `${f(k * k * k, 2)}x`, colour: A }]} />}
    format={(k) => ({ big: `Volume ${f(k * k * k, 2)}x, surface only ${f(k * k, 2)}x`,
      caption: 'The inside grows faster than the outside. That is why big packs are cheaper per gram!' })} />
)

const transform = () => (
  <SliderDemo label="Angle between the two mirrors" min={10} max={90} initial={45} suffix="°"
    visual={(a) => <Stage h={84} label="two reflections">
      <line x1="100" y1="76" x2="100" y2="10" stroke={LINE} strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="100" y1="76" x2={100 + 66 * Math.cos(-(90 - a) * Math.PI / 180)} y2={76 + 66 * Math.sin(-(90 - a) * Math.PI / 180)} stroke={LINE} strokeWidth="1.5" strokeDasharray="3 3" />
      <polygon points="76,66 92,66 84,48" fill="var(--clr-accent-soft)" stroke={B} strokeWidth="1.8" />
      <g transform={`rotate(${2 * a} 100 76)`}>
        <polygon points="76,66 92,66 84,48" fill="none" stroke={A} strokeWidth="1.8" />
      </g>
    </Stage>}
    format={(a) => ({ big: `Two reflections = one ${2 * a}° rotation`,
      caption: 'Two flips make exactly one turn! Games use this trick to move characters.' })} />
)

const bearings = () => (
  <SliderDemo label="Bearing" min={0} max={359} initial={90} suffix="°"
    visual={(b) => { const th = (b - 90) * Math.PI / 180
      return <Stage h={92} label="compass">
        <circle cx="100" cy="46" r="34" fill="none" stroke={LINE} strokeWidth="1.5" />
        <text x="100" y="10" fontSize="8" fill={SOFT} textAnchor="middle">N</text>
        <line x1="100" y1="46" x2="100" y2="16" stroke={LINE} strokeWidth="1" strokeDasharray="2 2" />
        <line x1="100" y1="46" x2={100 + 32 * Math.cos(th)} y2={46 + 32 * Math.sin(th)} stroke={A} strokeWidth="2.5" />
        <circle cx="100" cy="46" r="3" fill={INK} />
      </Stage> }}
    format={(b) => ({ big: `${String(b).padStart(3, '0')}°, reverse is ${String((b + 180) % 360).padStart(3, '0')}°`,
      caption: 'Always three digits, always clockwise from north. East is 090, never 90, so nobody can mishear it on a radio.' })} />
)

const coordgeom = () => (
  <SliderDemo label="Second point x" min={-4} max={5} initial={4}
    visual={(x2) => <FnPlot h={88} xMin={-5} xMax={6} yMin={-2} yMax={7} fns={[]}
      segs={[{ x1: -2, y1: 1, x2, y2: 5, colour: A }, { x1: -2, y1: 1, x2, y2: 1, colour: LINE, dashed: true }, { x1: x2, y1: 1, x2, y2: 5, colour: LINE, dashed: true }]}
      points={[{ x: -2, y: 1, colour: P }, { x: x2, y: 5, colour: P }]} />}
    format={(x2) => ({ big: `Distance = ${f(Math.hypot(x2 + 2, 4), 2)}`,
      caption: `The dashed lines are the two short sides: ${f(Math.abs(x2 + 2))} across and 4 up. The distance is Pythagoras on a hidden triangle!` })} />
)

const lineq = () => (
  <SliderDemo label="Gradient m" min={-3} max={3} step={0.5} initial={2}
    visual={(m) => <FnPlot h={84} xMin={-5} xMax={5} yMin={-6} yMax={6}
      fns={[{ f: (x) => m * x + 1, colour: A }]} points={[{ x: 0, y: 1, colour: P, label: 'c' }]} />}
    format={(m) => ({ big: `y = ${m}x + 1`,
      caption: `m is the slope, so ${m} means ${f(Math.abs(m), 1)} ${m < 0 ? 'down' : 'up'} for every 1 across. c = 1 is where it crosses the axis. Two numbers describe any straight line!` })} />
)

const trig = () => (
  <SliderDemo label="Angle up to the roof" min={15} max={70} initial={40} suffix="°"
    visual={(d) => { const h = Math.min(50 * Math.tan(d * Math.PI / 180) * 1.1, 58)
      return <Stage h={88} label="measuring a building">
        <line x1="30" y1="76" x2="160" y2="76" stroke={LINE} strokeWidth="1.5" />
        <rect x="140" y={76 - h} width="20" height={h} fill="var(--clr-accent-soft)" stroke={A} strokeWidth="1.8" />
        <line x1="30" y1="76" x2="140" y2={76 - h} stroke={P} strokeWidth="1.8" strokeDasharray="3 2" />
        <text x="80" y="86" fontSize="8" fill={SOFT} textAnchor="middle">50 m</text>
      </Stage> }}
    format={(d) => ({ big: `Building is ${f(50 * Math.tan(d * Math.PI / 180), 1)} m tall`,
      caption: 'Stand 50 m back, measure the angle, then multiply by tan. No ladder needed!' })} />
)

const invtrig = () => (
  <SliderDemo label="Opposite side, with hypotenuse 10" min={1} max={10} initial={6}
    visual={(o) => <Stage h={84} label="finding an angle">
      <polygon points={`30,74 ${30 + Math.sqrt(100 - o * o) * 12},74 ${30 + Math.sqrt(100 - o * o) * 12},${74 - o * 5.5}`} fill="var(--clr-accent-soft)" stroke={A} strokeWidth="2" />
    </Stage>}
    format={(o) => ({ big: `Angle = ${f(Math.asin(o / 10) * 180 / Math.PI, 1)}°`,
      caption: `sin of the angle is ${o}/10, so inverse sin finds the angle. Your calculator gives one answer, but ${f(180 - Math.asin(o / 10) * 180 / Math.PI, 1)}° has the same sine. Always draw a sketch!` })} />
)

const heron = () => (
  <SliderDemo label="Third side" min={4} max={12} initial={7}
    visual={(c) => <Poly h={80} pts={[[40, 68], [40 + c * 10, 68], [76, 22]]}
      texts={[{ x: 40 + c * 5, y: 78, t: `${c}` }, { x: 50, y: 44, t: '9' }, { x: 100, y: 44, t: '8' }]} />}
    format={(c) => { const s = (9 + 8 + c) / 2
      const ar = Math.sqrt(Math.max(0, s * (s - 9) * (s - 8) * (s - c)))
      return { big: `Area = ${f(ar, 2)}`,
        caption: 'Three sides in, area out! No height and no angles needed.' } }} />
)

const section = () => (
  <SliderDemo label="Ratio m in m:1" min={1} max={6} initial={2}
    visual={(m) => { const t = m / (m + 1)
      return <NumLine min={0} max={10} ticks={2} h={54}
        marks={[{ at: 0, label: 'A', colour: B }, { at: 10, label: 'B', colour: B }, { at: 10 * t, label: 'P', colour: A }]} /> }}
    format={(m) => ({ big: `P sits ${f((m / (m + 1)) * 100)}% along`,
      caption: `Ratio ${m}:1 means AP is ${m} times PB, so P slides towards B as m grows. The bigger number pushes P further along.` })} />
)

const circmeasure = () => (
  <SliderDemo label="Angle" min={0.5} max={6} step={0.5} initial={1} suffix=" rad"
    visual={(r) => { const end = -Math.PI / 2 + r
      const large = r > Math.PI ? 1 : 0
      return <Stage h={92} label="radian arc">
        <circle cx="100" cy="48" r="34" fill="none" stroke={LINE} strokeWidth="1.5" />
        <path d={`M 100 14 A 34 34 0 ${large} 1 ${100 + 34 * Math.cos(end)} ${48 + 34 * Math.sin(end)}`} fill="none" stroke={A} strokeWidth="3" />
        <line x1="100" y1="48" x2="100" y2="14" stroke={P} strokeWidth="2" />
        <text x="112" y="36" fontSize="8" fill={P}>r</text>
      </Stage> }}
    format={(r) => ({ big: `Arc = ${f(r, 1)} x radius`,
      caption: r === 1 ? 'One radian: the arc is exactly as long as the radius. That is about 57.3°. Odd number, simple formula!'
        : 'Arc length is just r × θ. In degrees you would need an extra π/180 every time.' })} />
)

const conics = () => (
  <SliderDemo label="Slice angle" min={0} max={3} step={1} initial={1}
    visual={(k) => <FnPlot h={84} xMin={-5} xMax={5} yMin={-4} yMax={4} fns={
      k === 0 ? [{ f: (x) => Math.sqrt(Math.max(0, 9 - x * x)), colour: A }, { f: (x) => -Math.sqrt(Math.max(0, 9 - x * x)), colour: A }]
      : k === 1 ? [{ f: (x) => 2 * Math.sqrt(Math.max(0, 1 - (x * x) / 16)), colour: A }, { f: (x) => -2 * Math.sqrt(Math.max(0, 1 - (x * x) / 16)), colour: A }]
      : k === 2 ? [{ f: (x) => 0.35 * x * x - 3, colour: A }]
      : [{ f: (x) => Math.sqrt(Math.max(0, x * x - 1)) - 0, colour: A }, { f: (x) => -Math.sqrt(Math.max(0, x * x - 1)), colour: A }]} />}
    format={(k) => ({ big: ['Circle', 'Ellipse', 'Parabola', 'Hyperbola'][k],
      caption: 'Same cone, four different slices! Four curves that look different all come from one shape.' })} />
)

/* == CALCULUS ======================================================== */

const diff = () => (
  <SliderDemo label="Point on the curve" min={-3} max={3} step={0.25} initial={1}
    visual={(x) => <FnPlot h={88} xMin={-4} xMax={4} yMin={-2} yMax={10}
      fns={[{ f: (t) => t * t, colour: A }, { f: (t) => 2 * x * (t - x) + x * x, colour: P, dashed: true }]}
      points={[{ x, y: x * x, colour: P }]} />}
    format={(x) => ({ big: `Gradient here = ${f(2 * x, 2)}`,
      caption: 'The dashed line shows the speed at this exact moment, not the average. Slide two points together until they meet and you get this line.' })} />
)

const integ = () => (
  <SliderDemo label="Measure area up to x =" min={0.5} max={4} step={0.25} initial={2}
    visual={(x) => <FnPlot h={88} xMin={0} xMax={4} yMin={0} yMax={9}
      fns={[{ f: (t) => t * t / 2, colour: A }]} bands={[{ from: 0, to: x, f: (t) => t * t / 2, colour: A }]} />}
    format={(x) => ({ big: `Shaded area = ${f((x * x * x) / 6, 2)}`,
      caption: 'If the curve were speed, the shaded area would be the distance travelled! It is lots of thin strips added up.' })} />
)

const limits = () => (
  <SliderDemo label="Move x towards zero" min={1} max={20} initial={4}
    visual={(k) => <FnPlot h={88} xMin={0} xMax={5} yMin={0} yMax={12}
      fns={[{ f: (t) => (t <= 0 ? NaN : 1 / t), colour: A }]}
      points={[{ x: 5 / k, y: k / 5, colour: P }]} />}
    format={(k) => ({ big: `x = ${f(5 / k, 3)}, y = ${f(k / 5, 2)}`,
      caption: 'It gets closer and closer to the axis but never touches it. Limits let maths talk about getting close without arriving.' })} />
)

const diffeq = () => (
  <SliderDemo label="Half life" min={1} max={10} initial={3} suffix=" days"
    visual={(h) => <FnPlot h={88} xMin={0} xMax={20} yMin={0} yMax={110}
      fns={[{ f: (t) => 100 * Math.pow(0.5, t / h), colour: A }]} />}
    format={(h) => ({ big: `After ${h * 3} days, 12.5% is left`,
      caption: 'The less there is, the slower it shrinks, so it never quite reaches zero. Cooling chai follows the same rule!' })} />
)

/* == STATS AND PROBABILITY =========================================== */

const stats = () => (
  <SliderDemo label="Spread" min={0} max={45} initial={30}
    visual={(s) => <Stage h={72} label="same mean, different spread">
      <line x1="100" y1="8" x2="100" y2="64" stroke={A} strokeWidth="1.5" strokeDasharray="3 3" />
      {[-4, -2, 0, 2, 4].map((v, i) => <circle key={`t${i}`} cx={100 + v * 1.8} cy="24" r="5" fill={B} opacity="0.85" />)}
      {[-s, -s / 2, 0, s / 2, s].map((v, i) => <circle key={`w${i}`} cx={100 + v * 1.8} cy="52" r="5" fill={P} opacity="0.85" />)}
    </Stage>}
    format={(s) => ({ big: 'Both rows average exactly 50',
      caption: s > 25 ? 'Same average, very different classes! In one, everyone is in the middle. In the other, some fail and some top the class.'
        : 'Drag the spread wider and watch the average stay put!' })} />
)

const prob = () => (
  <SliderDemo label="People in the room" min={2} max={60} initial={23}
    visual={(n) => { let p = 1; for (let i = 0; i < n; i++) p *= (365 - i) / 365
      return <Bars max={100} h={46} items={[
        { label: 'shared', value: (1 - p) * 100, display: `${f((1 - p) * 100, 1)}%`, colour: A },
        { label: 'all different', value: p * 100, display: `${f(p * 100, 1)}%`, colour: LINE }]} /> }}
    format={(n) => { let p = 1; for (let i = 0; i < n; i++) p *= (365 - i) / 365
      return { big: `${f((1 - p) * 100, 1)}% chance two share a birthday`,
        caption: n >= 23 ? 'Just 23 people and it is already more likely than not! Every person is compared with every other person.'
          : 'Slide it to 23 and watch it pass half. Almost nobody guesses that low!' } }} />
)

const sets = () => (
  <SliderDemo label="Like both" min={0} max={12} initial={6}
    visual={(b) => <Stage h={80} label="venn diagram">
      <circle cx="82" cy="40" r="30" fill={B} opacity="0.3" stroke={B} strokeWidth="1.5" />
      <circle cx="118" cy="40" r="30" fill={P} opacity="0.3" stroke={P} strokeWidth="1.5" />
      <text x="66" y="44" fontSize="10" fill={INK} textAnchor="middle">{18 - b}</text>
      <text x="100" y="44" fontSize="10" fill={A} textAnchor="middle" fontWeight="700">{b}</text>
      <text x="134" y="44" fontSize="10" fill={INK} textAnchor="middle">{15 - b}</text>
    </Stage>}
    format={(b) => ({ big: `18 + 15 - ${b} = ${33 - b} kids`,
      caption: `Add both groups and you get 33, but ${b} got counted twice. Take the overlap away once and the total is right!` })} />
)

const permcomb = () => (
  <SliderDemo label="Password length" min={1} max={12} initial={6}
    visual={(n) => <Bars max={12} h={46} items={[
      { label: `${n} chars`, value: n, display: `${sci(Math.pow(62, n))} options`, colour: A }]} />}
    format={(n) => ({ big: `${humanTime(Math.pow(62, n) / 1e9)} to crack`,
      caption: 'Each extra character multiplies the choices by 62! That is why long passwords beat clever ones.' })} />
)

/* == VECTORS AND MATRICES ============================================ */

const vectors = () => (
  <SliderDemo label="Then go north" min={0} max={8} initial={4} suffix=" km"
    visual={(n) => <FnPlot h={88} xMin={-1} xMax={9} yMin={-1} yMax={9} fns={[]}
      segs={[{ x1: 0, y1: 0, x2: 3, y2: 0, colour: B }, { x1: 3, y1: 0, x2: 3, y2: n, colour: P }, { x1: 0, y1: 0, x2: 3, y2: n, colour: A, dashed: true }]}
      points={[{ x: 3, y: n, colour: A }]} />}
    format={(n) => ({ big: `3 east + ${n} north = ${f(Math.hypot(3, n), 2)} km away`,
      caption: `Not ${3 + n}! When direction matters, adding works differently. The dashed line is the straight-line distance from the start.` })} />
)

const dotprod = () => (
  <SliderDemo label="Angle between them" min={0} max={180} step={5} initial={60} suffix="°"
    visual={(d) => { const r = (d * Math.PI) / 180
      return <FnPlot h={88} xMin={-5} xMax={5} yMin={-3} yMax={5} fns={[]}
        segs={[{ x1: 0, y1: 0, x2: 4, y2: 0, colour: B }, { x1: 0, y1: 0, x2: 4 * Math.cos(r), y2: 4 * Math.sin(r), colour: P }]} /> }}
    format={(d) => { const v = 16 * Math.cos((d * Math.PI) / 180); return {
      big: `Dot product = ${f(v, 2)}`,
      caption: d === 90 ? 'Exactly zero at 90°! A computer can test for right angles in one quick step.'
        : 'It shows how much the two arrows point the same way. Drag to 90° and watch it drop to zero!' } }} />
)

const matrix = () => (
  <SliderDemo label="Rotate first, by" min={0} max={90} step={15} initial={45} suffix="°"
    visual={(d) => { const r = (d * Math.PI) / 180
      const sq = [[0, 0], [2, 0], [2, 2], [0, 2]]
      const rot = sq.map(([x, y]) => [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)])
      const rotThenMove = rot.map(([x, y]) => [x + 3, y])
      const moveThenRot = sq.map(([x, y]) => [(x + 3) * Math.cos(r) - y * Math.sin(r), (x + 3) * Math.sin(r) + y * Math.cos(r)])
      const toStr = (p) => p.map(([x, y]) => `${100 + x * 14},${76 - y * 14}`).join(' ')
      return <Stage h={88} label="order matters">
        <polygon points={toStr(rotThenMove)} fill="none" stroke={A} strokeWidth="2" />
        <polygon points={toStr(moveThenRot)} fill="none" stroke={P} strokeWidth="2" strokeDasharray="4 3" />
      </Stage> }}
    format={(d) => ({ big: d === 0 ? 'At 0° they happen to agree' : 'Two different landing spots',
      caption: 'Orange turned, then moved. Purple moved, then turned. Same two moves, different places. Order matters!' })} />
)

/* == OTHER =========================================================== */

const spot = () => (
  <SliderDemo label="Objects per panel" min={3} max={12} initial={6}
    visual={(n) => <CellGrid rows={n} cols={n} h={90} label="every pair you could compare"
      fill={(r, c) => (r === n - 2 && c === 1 ? A : LINE)} />}
    format={(n) => ({ big: `${n * n} pairs to check, 1 real match`,
      caption: `Checking every object against every other takes ${n} × ${n} looks. Remembering what you saw cuts it to about ${2 * n}. Smart searching!` })} />
)

/* == Registry ======================================================== */

// Private: react-refresh requires this module to export components only, so
// the map is reached through <WhyDemo> rather than exported alongside them.
// Keys are prerequisiteGraph topic ids, matching demo.kind in the data.
const DEMOS = {
  basicarith, addition, multiply, rounding, fractionadd, percent, profitloss,
  ratio, sdt, squaring, decimals, shares, banking, gst,
  hcflcm, primefactor, bases,
  sqrt, indices, surds, stdform, log, quadratic, funceval, polymul, polyfactor,
  qformula, simul, ineq, sequences, variation, binomial, complex, bounds,
  lineareq, linprog, remfactor,
  angles, triangles, polygons, congruence, similarity, pythag, circleth,
  mensur, transform, bearings, coordgeom, lineq, trig, invtrig, heron,
  section, circmeasure, conics,
  diff, integ, limits, diffeq,
  stats, prob, sets, permcomb,
  vectors, dotprod, matrix,
  spot,
}

/**
 * Renders the demo a topic asked for. Unknown or missing kind renders
 * nothing rather than throwing, so a typo in the data costs a widget and
 * not the whole quiz screen. studyMode.test.js asserts the data and this
 * registry agree in both directions.
 */
export default function WhyDemo({ kind }) {
  const Demo = kind ? DEMOS[kind] : null
  return Demo ? <Demo /> : null
}

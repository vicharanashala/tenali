/**
 * whyMathBeats.jsx - the content pool behind "Why Mathematics?".
 *
 * Written for children. Every beat is one surprise in three moves:
 *   1. Guess   - a question and three answers. The child commits first, so
 *                the result can actually surprise them.
 *   2. Find out - a slider and a live picture. Reaching `aim` reveals the
 *                answer.
 *   3. Why      - one or two short sentences on what just happened.
 *
 * Beat fields:
 *   key, emoji, question
 *   guess:   { options: [three strings], answer: the correct option }
 *   label, min, max, step?, suffix?, initial(): starting value, aim
 *   visual(v): live SVG for the current value
 *   read(v):  { big } the live result line under the slider
 *   reveal:   short headline shown once the aim is reached
 *   why:      the explanation, kept short (whyMath.test.jsx checks length)
 *
 * Kept separate from WhyMathApp.jsx so the content is reviewable on its
 * own and testable: whyMath.test.jsx walks every beat across its whole
 * slider range looking for NaN, Infinity or a crash.
 *
 * Exports data only. The drawings are plain functions returning SVG, not
 * components, so react-refresh stays happy.
 */

import { Stage, Bars, CellGrid, FnPlot, INK, SOFT, LINE, A, P, B, G } from './whyVisuals.jsx';

const f = (n, d = 0) => n.toLocaleString('en-IN', { maximumFractionDigits: d });

export function humanTime(s) {
  if (s < 1) return 'less than a second';
  if (s < 60) return `${f(s)} second${Math.round(s) === 1 ? '' : 's'}`;
  if (s < 3600) return `${f(s / 60)} minutes`;
  if (s < 86400) return `${f(s / 3600)} hours`;
  if (s < 3.15e7) return `${f(s / 86400)} days`;
  const y = s / 3.15e7;
  if (y < 1e6) return `${f(y)} years`;
  if (y < 1e9) return `${f(y / 1e6)} million years`;
  return `${f(y / 1e9)} billion years`;
}

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

/* -- paper folding: landmarks instead of a log graph ------------------ */

const PAPER_M = 0.0001; // one sheet is about 0.1 mm thick
const LANDMARKS = [
  { at: 0.03, icon: '📕', name: 'a thick book' },
  { at: 1.4, icon: '🧒', name: 'you' },
  { at: 73, icon: '🗼', name: 'the Qutub Minar' },
  { at: 8849, icon: '🏔️', name: 'Mount Everest' },
  { at: 400000, icon: '🛰️', name: 'the Space Station' },
  { at: 384400000, icon: '🌕', name: 'the Moon' },
];
// Emoji need an emoji font named explicitly: the app's text stack falls
// back to fonts with plain black-and-white versions of some (the Moon
// renders as an empty circle).
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

const thickness = (folds) => PAPER_M * Math.pow(2, folds);
const foldsFor = (m) => Math.log2(m / PAPER_M);
const passedLandmark = (folds) => [...LANDMARKS].reverse().find((l) => thickness(folds) >= l.at) || null;

function formatLength(m) {
  if (m < 0.01) return `${f(m * 1000, 1)} mm`;
  if (m < 1) return `${f(m * 100, 1)} cm`;
  if (m < 1000) return `${f(m, 1)} m`;
  return `${f(m / 1000)} km`;
}

function foldLadder(folds) {
  const x = (n) => 10 + (180 * n) / 45;
  return (
    <Stage h={84} label={`paper ${formatLength(thickness(folds))} thick`}>
      <line x1="10" y1="58" x2="190" y2="58" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
      <rect x="10" y="54" width={Math.max(0, x(folds) - 10)} height="8" rx="4" fill={A} />
      {LANDMARKS.map((l) => {
        const lx = x(foldsFor(l.at));
        const done = thickness(folds) >= l.at;
        return (
          <g key={l.name} opacity={done ? 1 : 0.35}>
            <text x={lx} y="38" fontSize="15" textAnchor="middle" fontFamily={EMOJI_FONT}>{l.icon}</text>
            <line x1={lx} y1="46" x2={lx} y2="54" stroke={done ? A : LINE} strokeWidth="1.5" />
          </g>
        );
      })}
      <circle cx={x(folds)} cy="58" r="5" fill={P} />
      <text x={Math.min(172, Math.max(28, x(folds)))} y="78" fontSize="8" fill={SOFT} textAnchor="middle">{folds} folds</text>
    </Stage>
  );
}

/* -- handshakes: every pair joined by a line -------------------------- */

function handshakeWeb(n) {
  const pts = Array.from({ length: n }, (_, i) => {
    const t = (2 * Math.PI * i) / n - Math.PI / 2;
    return [100 + 38 * Math.cos(t), 46 + 38 * Math.sin(t)];
  });
  const lines = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      lines.push(<line key={`${i}-${j}`} x1={pts[i][0]} y1={pts[i][1]} x2={pts[j][0]} y2={pts[j][1]}
        stroke={A} strokeWidth={n > 15 ? 0.35 : 0.8} opacity="0.7" />);
    }
  }
  return (
    <Stage h={92} label={`${n} kids, ${(n * (n - 1)) / 2} handshakes`}>
      {lines}
      {pts.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={n > 15 ? 2.6 : 3.6} fill={B} />)}
    </Stage>
  );
}

/* -- rice on a chessboard --------------------------------------------- */

const RICE_SIZES = [
  { at: 200, name: 'a spoonful' },
  { at: 6000, name: 'a bowlful' },
  { at: 1e6, name: 'a big sack' },
  { at: 4e8, name: 'a truck full' },
  { at: 2e16, name: 'all the rice the world grows in a year' },
];
function riceText(grains) {
  if (grains >= 2e16) return `about ${f(grains / 2e16)} years of all the world's rice`;
  const size = [...RICE_SIZES].reverse().find((s) => grains >= s.at);
  return size ? `more than ${size.name}` : 'a few grains';
}

/* -- the beat pool ---------------------------------------------------- */

export const BEATS = [
  {
    key: 'birthday',
    emoji: '🎂',
    question: 'How many people do you need in a room before two of them probably share a birthday?',
    guess: { options: ['23 people', '100 people', '183 people'], answer: '23 people' },
    label: 'People in the room',
    min: 2, max: 60, initial: () => rand(5, 12), aim: 23,
    visual: (n) => {
      let p = 1;
      for (let i = 0; i < n; i++) p *= (365 - i) / 365;
      return <Bars h={46} max={100} items={[
        { label: 'a match', value: (1 - p) * 100, display: `${f((1 - p) * 100)}%`, colour: A },
        { label: 'no match', value: p * 100, display: `${f(p * 100)}%`, colour: LINE }]} />;
    },
    read: (n) => {
      let p = 1;
      for (let i = 0; i < n; i++) p *= (365 - i) / 365;
      return { big: `${f((1 - p) * 100)}% chance of a shared birthday` };
    },
    reveal: 'Just 23 people!',
    why: 'You are not only comparing people with you. Everyone is compared with everyone else. 23 people make 253 pairs, so a match becomes more likely than not.',
  },
  {
    key: 'folding',
    emoji: '📄',
    question: 'How many times would you fold a sheet of paper in half for it to reach the Moon?',
    guess: { options: ['42 times', '1,000 times', '1 million times'], answer: '42 times' },
    label: 'Folds',
    min: 0, max: 45, initial: () => rand(3, 8), aim: 42,
    visual: (n) => foldLadder(n),
    read: (n) => {
      const top = passedLandmark(n);
      return { big: `${formatLength(thickness(n))} thick${top ? `, higher than ${top.name}!` : ''}` };
    },
    reveal: 'Just 42 folds!',
    why: 'Every fold doubles the thickness. Doubling starts slow, then grows super fast. You cannot really fold paper that many times, but the maths is true!',
  },
  {
    key: 'handshakes',
    emoji: '🤝',
    question: '30 kids each shake hands once with every other kid. How many handshakes is that?',
    guess: { options: ['60', '435', '900'], answer: '435' },
    label: 'Kids in the class',
    min: 2, max: 30, initial: () => rand(3, 6), aim: 30,
    visual: (n) => handshakeWeb(n),
    read: (n) => ({ big: `${n} kids make ${f((n * (n - 1)) / 2)} handshakes` }),
    reveal: '435 handshakes!',
    why: 'Each kid shakes 29 hands, and 30 × 29 = 870. But every handshake has two people, so it got counted twice. Half of 870 is 435!',
  },
  {
    key: 'code',
    emoji: '🔒',
    question: 'A robot can try 1,000 codes every second. How long does it need to crack a 4-digit PIN?',
    guess: { options: ['10 seconds', '1 hour', '1 year'], answer: '10 seconds' },
    label: 'Digits in the code',
    min: 1, max: 12, initial: () => 1, aim: 4,
    visual: (d) => <Bars h={46} max={12} items={[
      { label: '🤖 tries', value: d, display: `${f(Math.pow(10, d))} codes`, colour: A }]} />,
    read: (d) => ({ big: `${humanTime(Math.pow(10, d) / 1000)} to crack every code` }),
    reveal: 'Only 10 seconds!',
    why: 'A 4-digit PIN has just 10,000 choices. Each extra digit makes 10 times as many. Keep dragging: with 12 digits the robot needs about 32 years!',
  },
  {
    key: 'giants',
    emoji: '🦖',
    question: 'If you grew 10 times taller, what would happen?',
    guess: { options: ['Your legs would break', 'You would be super strong', 'Nothing would change'], answer: 'Your legs would break' },
    label: 'Times taller',
    min: 1, max: 10, step: 0.5, initial: () => 1.5, aim: 10, suffix: '×',
    visual: (k) => <Bars h={46} max={1000} items={[
      { label: '💪 strength', value: k * k, display: `${f(k * k, 1)}×`, colour: B },
      { label: '⚖️ weight', value: k * k * k, display: `${f(k * k * k, 1)}×`, colour: A }]} />,
    read: (k) => ({ big: `${f(k * k, 1)}× stronger, but ${f(k * k * k, 1)}× heavier` }),
    reveal: 'Snap! Your legs could not hold you.',
    why: 'Strength depends on how thick your bones are. Weight depends on your whole body, and it grows much faster. That is why real giants are impossible!',
  },
  {
    key: 'average',
    emoji: '📊',
    question: 'Two classes both have an average mark of 50. Are the two classes the same?',
    guess: { options: ['Not always!', 'Yes, exactly the same', 'Only on Mondays'], answer: 'Not always!' },
    label: 'Spread out the purple class',
    min: 0, max: 45, initial: () => rand(0, 6), aim: 30,
    visual: (s) => <Stage h={70} label="same average, different spread">
      <line x1="100" y1="8" x2="100" y2="62" stroke={A} strokeWidth="1.5" strokeDasharray="3 3" />
      {[-4, -2, 0, 2, 4].map((v, i) => <circle key={`t${i}`} cx={100 + v * 1.8} cy="24" r="5.5" fill={B} opacity="0.85" />)}
      {[-s, -s / 2, 0, s / 2, s].map((v, i) => <circle key={`w${i}`} cx={100 + v * 1.8} cy="50" r="5.5" fill={P} opacity="0.85" />)}
    </Stage>,
    read: () => ({ big: 'Both classes still average 50' }),
    reveal: 'Same average, very different classes!',
    why: 'In the blue class everyone scored about 50. In the purple class some scored 100 and some scored 0. An average alone can hide the real story.',
  },
  {
    key: 'a4',
    emoji: '📐',
    question: 'Why does A4 paper keep exactly the same shape when you fold it in half?',
    guess: { options: ['Its sides follow a special ratio', 'It is just luck', 'The paper stretches'], answer: 'Its sides follow a special ratio' },
    label: 'Fold it in half',
    min: 0, max: 4, initial: () => 0, aim: 2,
    visual: (n) => {
      let w = 120, h = 120 / Math.SQRT2;
      for (let i = 0; i < n; i++) { const nw = h; h = w / 2; w = nw; }
      return <Stage h={80} label="A series paper">
        <rect x={100 - w / 2} y={40 - h / 2} width={w} height={h} rx="2"
              fill="var(--clr-accent-soft)" stroke={A} strokeWidth="2" />
        <text x="100" y="44" fontSize="10" fill={INK} textAnchor="middle" fontWeight="700">A{4 + n}</text>
      </Stage>;
    },
    read: (n) => ({ big: `A${4 + n}, and still the same shape` }),
    reveal: 'A special ratio!',
    why: 'The long side of A4 is about 1.41 times the short side. That number is √2. Fold it in half and the ratio stays the same, so A5, A6 and A7 all match.',
  },
  {
    key: 'gps',
    emoji: '🛰️',
    question: 'How many satellites does your phone need to find exactly where you are?',
    guess: { options: ['3', '1', '2'], answer: '3' },
    label: 'Satellites',
    min: 1, max: 3, initial: () => 1, aim: 3,
    visual: (n) => <Stage h={86} label="trilateration">
      {[[70, 40, 34], [130, 38, 30], [104, 70, 26]].slice(0, n).map((c, i) => (
        <circle key={i} cx={c[0]} cy={c[1]} r={c[2]} fill="none"
                stroke={[B, P, G][i]} strokeWidth="1.8" opacity="0.9" />
      ))}
      {n === 3 && <circle cx="100" cy="44" r="4.5" fill={A} />}
    </Stage>,
    read: (n) => ({ big: ['You are somewhere on this circle', 'Down to two possible spots', 'Exactly one spot: you!'][n - 1] }),
    reveal: 'Found you!',
    why: 'Each satellite tells your phone how far away it is. One distance gives a circle and two give two spots. Three meet at exactly one spot, and that is you!',
  },
  {
    key: 'discount',
    emoji: '🏷️',
    question: 'A shop gives 50% off, then another 20% off. How much do you save in total?',
    guess: { options: ['60%', '70%', '40%'], answer: '60%' },
    label: 'Second discount',
    min: 0, max: 50, step: 5, initial: () => 5 * rand(0, 2), aim: 20, suffix: '%',
    visual: (p) => <Bars h={62} max={2400} items={[
      { label: 'price', value: 2400, display: '₹2400', colour: LINE },
      { label: 'after 50%', value: 1200, display: '₹1200', colour: B },
      { label: `then ${p}%`, value: 1200 * (1 - p / 100), display: `₹${f(1200 * (1 - p / 100))}`, colour: A }]} />,
    read: (p) => ({ big: `You save ${Math.round((1 - (1 - p / 100) / 2) * 100)}%, not ${50 + p}%` }),
    reveal: 'Only 60%!',
    why: 'The second discount comes off the price that is left. ₹2400 becomes ₹1200, then ₹960. You saved ₹1440, which is 60%.',
  },
  {
    key: 'octave',
    emoji: '🎵',
    question: 'Play a note, then a note with double the frequency. How do they sound together?',
    guess: { options: ['Like the same note, just higher', 'Totally different', 'Like noise'], answer: 'Like the same note, just higher' },
    label: 'Multiply the frequency by',
    min: 1, max: 4, step: 0.25, initial: () => 1.25, aim: 2, suffix: '×',
    visual: (r) => <FnPlot h={76} xMin={0} xMax={12} yMin={-1.6} yMax={1.6}
      fns={[{ f: (x) => Math.sin(x * 1.6), colour: B },
            { f: (x) => Math.sin(x * 1.6 * r) * 0.85, colour: Number.isInteger(r) ? A : P }]} />,
    read: (r) => ({ big: r === 2 ? 'Double: the waves line up perfectly' : `${r} times the frequency` }),
    reveal: 'The same note, one octave up!',
    why: 'Double the frequency and the waves line up perfectly every time, so your ear hears one note. Simple ratios like this sound sweet. That is how music works!',
  },
  {
    key: 'chessboard',
    emoji: '🍚',
    question: 'A wise man asks a king for 1 grain of rice on the first chess square, 2 on the next, then 4, doubling each time. How much rice on the last square?',
    guess: { options: ['Hundreds of years of the world\'s rice', 'A big sack', 'A truck full'], answer: 'Hundreds of years of the world\'s rice' },
    label: 'Chess square',
    min: 1, max: 64, initial: () => rand(2, 5), aim: 64,
    visual: (n) => <CellGrid rows={8} cols={8} h={88} cell={10}
      fill={(r, c) => (r * 8 + c < n ? (r * 8 + c === n - 1 ? A : '#e8b04b') : LINE)} />,
    read: (n) => {
      const grains = Math.pow(2, n - 1);
      const count = grains < 1e9 ? `${f(grains)} grain${grains === 1 ? '' : 's'}` : `A ${String(BigInt(2) ** BigInt(n - 1)).length}-digit number of grains`;
      return { big: `${count}: ${riceText(grains)}` };
    },
    reveal: 'More rice than the world grows in hundreds of years!',
    why: 'Square 10 has only 512 grains. But doubling 63 times makes a 19-digit number. The king could never pay!',
  },
  {
    key: 'savings',
    emoji: '🐷',
    question: 'Your savings grow by 10% every year. How long until they double?',
    guess: { options: ['About 7 years', 'About 10 years', 'About 20 years'], answer: 'About 7 years' },
    label: 'Growth each year',
    min: 1, max: 24, initial: () => rand(2, 4), aim: 10, suffix: '%',
    visual: (r) => <FnPlot h={76} xMin={0} xMax={30} yMin={0} yMax={800}
      fns={[{ f: (t) => 100 * Math.pow(1 + r / 100, t), colour: A },
            { f: (t) => 100 + 100 * (r / 100) * t, colour: LINE, dashed: true }]} />,
    read: (r) => ({ big: `Doubles in about ${f(Math.log(2) / Math.log(1 + r / 100))} years` }),
    reveal: 'About 7 years!',
    why: 'Each year you also earn on what you earned before, so it speeds up. A handy trick: divide 72 by the rate. 72 ÷ 10 is about 7.',
  },
];

export const HOOKS = [
  'Why learn maths? Let me show you four surprises. Guess first, then find out!',
  'Maths can surprise you. Here are four puzzles. Make a guess, then see if you were right!',
  'Grown-ups get these wrong all the time. Can you beat them? Guess first, then drag to find out!',
];

/** Closing line from Tenali, by how many guesses were right. */
export function closeLine(right, total) {
  if (right === total) return 'Wow, you got every one! You think like a mathematician already.';
  if (right === 0) return 'Every single one surprised you! That is exactly why maths is worth learning.';
  if (right * 2 >= total) return 'Great guessing! And the ones that surprised you? That is where maths helps.';
  return 'Some of those were tricky! Maths is how you check what your gut tells you.';
}

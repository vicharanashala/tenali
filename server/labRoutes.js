const express = require('express');
const router = express.Router();

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const emojis = ['⭐','🍎','🍕','🚗','🚀','🎈','🌻','🐶','🧸','💎','🍩','⚽','📚'];

// 1. Basic Arithmetic Lab
const basicTemplates = ['missing_number', 'true_false', 'match_expression', 'fact_family', 'greater_smaller'];
router.get('/basic-arithmetic-lab/generate', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  const template = randomChoice(basicTemplates);
  const max = diff === 'hard' ? 12 : (diff === 'medium' ? 9 : 5);
  let q = { id: `ba-${Date.now()}`, template };

  const a = randomInt(2, max);
  const b = randomInt(2, max);
  const op = randomChoice(['x', '/']);

  if (template === 'missing_number') {
    if (op === 'x') {
      const isA = Math.random() > 0.5;
      q.prompt = isA ? `? × ${b} = ${a*b}` : `${a} × ? = ${a*b}`;
      q.answer = isA ? a : b;
    } else {
      const prod = a * b;
      const isDiv = Math.random() > 0.5;
      q.prompt = isDiv ? `? ÷ ${a} = ${b}` : `${prod} ÷ ? = ${b}`;
      q.answer = isDiv ? prod : a;
    }
  } else if (template === 'true_false') {
    const isCorrect = Math.random() > 0.5;
    const prod = a * b;
    const fakeProd = isCorrect ? prod : prod + randomInt(-2, 2) || (prod + 1);
    if (op === 'x') {
      q.prompt = `Is ${a} × ${b} = ${fakeProd} ?`;
      q.answer = isCorrect ? 'True' : 'False';
    } else {
      q.prompt = `Is ${prod} ÷ ${a} = ${isCorrect ? b : b + randomInt(-2, 2) || (b + 1)} ?`;
      q.answer = isCorrect ? 'True' : 'False';
    }
  } else if (template === 'match_expression') {
    const prod = a * b;
    q.prompt = `Which expression equals ${prod}?`;
    const options = [
      `${a} × ${b}`,
      `${a+1} × ${b}`,
      `${a} × ${b-1}`,
      `${a+1} × ${b-1}`
    ].sort(() => Math.random() - 0.5);
    q.options = options;
    q.answer = `${a} × ${b}`;
  } else if (template === 'fact_family') {
    const prod = a * b;
    const missing = randomChoice(['prod', 'a', 'b']);
    if (missing === 'prod') {
      q.prompt = `Fact Family: ${a}, ${b}, ?. If ${a}×${b}=?, what is ?`;
      q.answer = prod;
    } else if (missing === 'a') {
      q.prompt = `Fact Family: ?, ${b}, ${prod}. If ?×${b}=${prod}, what is ?`;
      q.answer = a;
    } else {
      q.prompt = `Fact Family: ${a}, ?, ${prod}. If ${prod}÷?=${a}, what is ?`;
      q.answer = b;
    }
  } else if (template === 'greater_smaller') {
    const c = randomInt(2, max);
    const d = randomInt(2, max);
    const prod1 = a * b;
    const prod2 = c * d;
    q.prompt = `Compare: ${a} × ${b}   __   ${c} × ${d}`;
    q.options = ['>', '<', '='];
    if (prod1 > prod2) q.answer = '>';
    else if (prod1 < prod2) q.answer = '<';
    else q.answer = '=';
  }
  res.json(q);
});

router.post('/basic-arithmetic-lab/check', (req, res) => {
  const { answerOption, expected } = req.body;
  if (req.body.solve) return res.json({ correct: false, correctAnswer: expected });
  const correct = String(answerOption).trim().toLowerCase() === String(expected).trim().toLowerCase();
  res.json({ correct, correctAnswer: expected });
});

// 2. Mensuration Lab
const shapeNames = {
  3: 'Triangle', 4: 'Quadrilateral', 5: 'Pentagon',
  6: 'Hexagon', 7: 'Heptagon', 8: 'Octagon'
};
const angleTypes = ['acute', 'right', 'obtuse'];

const mensurationTemplates = [
  'count_sides', 'perimeter_blocks', 'compare_area', 'rect_vs_square',
  'shape_name', 'triangle_area', 'angle_type', 'circle_q', 'missing_side'
];

router.get('/mensuration-lab/generate', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  // Restrict to simpler templates on easy
  const easyTemplates = ['rect_vs_square', 'shape_name', 'angle_type'];
  const mediumTemplates = ['perimeter_blocks', 'compare_area', 'shape_name', 'triangle_area', 'missing_side'];
  const hardTemplates = ['perimeter_blocks', 'compare_area', 'triangle_area', 'circle_q', 'missing_side'];
  const pool = diff === 'hard' ? hardTemplates : diff === 'medium' ? mediumTemplates : easyTemplates;
  const template = randomChoice(pool);
  const max = diff === 'hard' ? 10 : (diff === 'medium' ? 7 : 5);
  let q = { id: `me-${Date.now()}`, template };

  if (template === 'perimeter_blocks') {
    const w = randomInt(2, max);
    const h = randomInt(2, max);
    q.prompt = `🏃 Walk all the way around! What is the perimeter?`;
    q.w = w; q.h = h;
    q.answer = 2 * (w + h);
    q.hint = `Perimeter = 2 × (${w} + ${h}) = ${2*(w+h)}`;
    q.options = [2*(w+h)-2, 2*(w+h), 2*(w+h)+2, w*h].filter((v,i,a)=>a.indexOf(v)===i).sort(()=>Math.random()-0.5).map(String);
  } else if (template === 'compare_area') {
    const w1 = randomInt(2, max), h1 = randomInt(2, max);
    let w2 = randomInt(2, max), h2 = randomInt(2, max);
    // Ensure they are different for more interesting questions
    while (w1*h1 === w2*h2) { w2 = randomInt(2, max); h2 = randomInt(2, max); }
    q.prompt = `🤔 Which shape has the BIGGER area?`;
    q.shape1 = {w: w1, h: h1, label: 'A', color: '#FF7E67'};
    q.shape2 = {w: w2, h: h2, label: 'B', color: '#FFD166'};
    q.options = ['Shape A', 'Shape B', 'They are Equal'];
    const a1 = w1*h1; const a2 = w2*h2;
    if (a1 > a2) q.answer = 'Shape A';
    else if (a2 > a1) q.answer = 'Shape B';
    else q.answer = 'They are Equal';
    q.hint = `Shape A Area = ${a1} (${w1}×${h1}), Shape B Area = ${a2} (${w2}×${h2})`;
  } else if (template === 'rect_vs_square') {
    const isSquare = Math.random() > 0.5;
    const w = randomInt(2, max);
    const h = isSquare ? w : (w + randomInt(1, 3));
    q.prompt = `🔍 Look carefully! Is this shape a Rectangle or a Square?`;
    q.w = w; q.h = h;
    q.options = ['Rectangle', 'Square'];
    q.answer = w === h ? 'Square' : 'Rectangle';
    q.hint = w === h ? `All sides are equal (${w} units) → Square! ✓` : `Width ${w} ≠ Height ${h} → Rectangle! ✓`;
  } else if (template === 'shape_name') {
    const sides = randomInt(3, 8);
    const name = shapeNames[sides];
    q.prompt = `🌟 What is the name of this shape?`;
    q.sides = sides;
    q.answer = name;
    q.hint = `A polygon with ${sides} sides is a ${name}`;
    const wrongSides = Object.keys(shapeNames).map(Number).filter(s => s !== sides);
    const picks = wrongSides.sort(() => Math.random()-0.5).slice(0, 3).map(s => shapeNames[s]);
    q.options = [...picks, name].sort(() => Math.random()-0.5);
    q.color = randomChoice(['#FF6B6B','#4ECDC4','#45B7D1','#FFEAA7','#DDA0DD','#96CEB4']);
  } else if (template === 'triangle_area') {
    const base = randomInt(2, max);
    const height = randomInt(2, max);
    const area = base * height / 2;
    q.prompt = `📐 What is the area of this triangle? (Area = ½ × base × height)`;
    q.base = base; q.height = height;
    q.answer = area;
    q.hint = `½ × ${base} × ${height} = ${area}`;
    const opts = [area-1, area, area+1, area+2].filter(v=>v>0).filter((v,i,a)=>a.indexOf(v)===i).sort(()=>Math.random()-0.5).map(String);
    q.options = opts;
  } else if (template === 'angle_type') {
    const type = randomChoice(angleTypes);
    let degrees;
    if (type === 'acute') degrees = randomInt(10, 89);
    else if (type === 'right') degrees = 90;
    else degrees = randomInt(91, 170);
    q.prompt = `📏 Is this angle ACUTE, RIGHT, or OBTUSE?`;
    q.degrees = degrees;
    q.answer = type.charAt(0).toUpperCase() + type.slice(1);
    q.options = ['Acute', 'Right', 'Obtuse'];
    q.hint = type === 'acute' ? 'Acute: less than 90°' : type === 'right' ? 'Right: exactly 90°' : 'Obtuse: more than 90°';
  } else if (template === 'circle_q') {
    const r = randomInt(2, 8);
    const isCircumference = Math.random() > 0.5;
    if (isCircumference) {
      const val = Math.round(2 * Math.PI * r * 10) / 10;
      q.prompt = `⭕ Find the circumference of a circle with radius ${r}. (Use π ≈ 3.14)`;
      q.answer = val;
      q.radius = r;
      q.subtype = 'circumference';
      q.hint = `C = 2πr = 2 × 3.14 × ${r} = ${val}`;
      const opts = [val-1, val, val+1, val+2].map(v => Math.round(v*10)/10).filter((v,i,a)=>a.indexOf(v)===i).sort(()=>Math.random()-0.5).map(String);
      q.options = opts;
    } else {
      const val = Math.round(Math.PI * r * r * 10) / 10;
      q.prompt = `⭕ Find the area of a circle with radius ${r}. (Use π ≈ 3.14)`;
      q.answer = val;
      q.radius = r;
      q.subtype = 'area';
      q.hint = `A = πr² = 3.14 × ${r}² = ${val}`;
      const opts = [val-2, val, val+2, val+4].map(v => Math.round(v*10)/10).filter((v,i,a)=>a.indexOf(v)===i).sort(()=>Math.random()-0.5).map(String);
      q.options = opts;
    }
  } else if (template === 'missing_side') {
    const isRect = Math.random() > 0.3;
    if (isRect) {
      const w = randomInt(2, max);
      const h = randomInt(2, max);
      const area = w * h;
      const missingW = Math.random() > 0.5;
      q.prompt = missingW
        ? `🔎 A rectangle has area ${area} and height ${h}. What is the missing width?`
        : `🔎 A rectangle has area ${area} and width ${w}. What is the missing height?`;
      q.answer = missingW ? w : h;
      q.knownSide = missingW ? h : w;
      q.area = area;
      q.subtype = 'rect_missing';
      const ans = missingW ? w : h;
      q.hint = missingW ? `Area ÷ Height = ${area} ÷ ${h} = ${w}` : `Area ÷ Width = ${area} ÷ ${w} = ${h}`;
      const opts = [ans-1, ans, ans+1, ans+2].filter(v=>v>0).filter((v,i,a)=>a.indexOf(v)===i).sort(()=>Math.random()-0.5).map(String);
      q.options = opts;
    } else {
      const side = randomInt(2, max);
      const perim = 4 * side;
      q.prompt = `🔎 A square has perimeter ${perim}. What is its side length?`;
      q.answer = side;
      q.perim = perim;
      q.subtype = 'square_missing';
      q.hint = `Perimeter ÷ 4 = ${perim} ÷ 4 = ${side}`;
      const opts = [side-1, side, side+1, side+2].filter(v=>v>0).filter((v,i,a)=>a.indexOf(v)===i).sort(()=>Math.random()-0.5).map(String);
      q.options = opts;
    }
  }
  res.json(q);
});

router.post('/mensuration-lab/check', (req, res) => {
  const { answerOption, expected } = req.body;
  if (req.body.solve) return res.json({ correct: false, correctAnswer: String(expected) });
  const correct = String(answerOption).trim().toLowerCase() === String(expected).trim().toLowerCase();
  res.json({ correct, correctAnswer: String(expected) });
});

// 3. Visual Math Lab Redux (Gamified)
const visualTemplates = ['plant_arrays', 'frog_jumps', 'candy_sharing', 'equal_groups', 'picture_multi', 'math_machine'];
router.get('/visual-math-lab-redux/generate', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  const lastTemplate = req.query.lastTemplate;
  
  let pool = visualTemplates;
  if (lastTemplate && visualTemplates.includes(lastTemplate) && visualTemplates.length > 1) {
    pool = visualTemplates.filter(t => t !== lastTemplate);
  }
  const template = randomChoice(pool);
  const max = diff === 'hard' ? 9 : (diff === 'medium' ? 6 : 4);
  let q = { id: `vmr-${Date.now()}`, template };

  const emoji = randomChoice(emojis);
  const a = randomInt(2, max);
  const b = randomInt(2, max);
  let ans = 0;

  if (template === 'plant_arrays') {
    q.prompt = `Plant seeds in ${a} rows and ${b} columns. How many plants will grow?`;
    q.rows = a; q.cols = b; q.emoji = '🌱';
    ans = a * b;
  } else if (template === 'frog_jumps') {
    q.prompt = `The frog makes ${a} jumps of ${b}. Where does it land?`;
    q.jumps = a; q.step = b;
    ans = a * b;
  } else if (template === 'candy_sharing') {
    const total = a * b;
    q.prompt = `Share ${total} 🍬 equally into ${a} baskets. How many in each?`;
    q.total = total; q.boxes = a; q.emoji = '🍬';
    ans = b;
  } else if (template === 'equal_groups') {
    q.prompt = `We have ${a} groups. Each group has ${b} items. How many in total?`;
    q.groups = a; q.itemsPerGroup = b; q.emoji = '🍪';
    ans = a * b;
  } else if (template === 'picture_multi') {
    const subjects = [
      { name: 'bicycles', parts: 'wheels', count: 2, icon: '🚲' },
      { name: 'traffic lights', parts: 'lights', count: 3, icon: '🚦' },
      { name: 'dogs', parts: 'legs', count: 4, icon: '🐕' }
    ];
    const sub = randomChoice(subjects);
    const n = randomInt(2, max);
    q.prompt = `If there are ${n} ${sub.name}, how many ${sub.parts} in total?`;
    q.n = n; q.count = sub.count; q.icon = sub.icon;
    ans = n * sub.count;
  } else if (template === 'math_machine') {
    q.prompt = `Put ${a} into the ×${b} machine! What number comes out?`;
    q.input = a; q.multiplier = b;
    ans = a * b;
  }

  q.answer = ans;
  // Generate 4 unique multiple choice options
  let opts = new Set([ans]);
  while(opts.size < 4) {
    let wrong = ans + randomChoice([-2, -1, 1, 2, 3, a, -a, b, -b]);
    if (wrong > 0 && wrong !== ans) opts.add(wrong);
  }
  q.options = Array.from(opts).sort((x, y) => x - y);
  
  res.json(q);
});

router.post('/visual-math-lab-redux/check', (req, res) => {
  const { answerOption, expected } = req.body;
  if (req.body.solve) return res.json({ correct: false, correctAnswer: String(expected) });
  const correct = String(answerOption).trim().toLowerCase() === String(expected).trim().toLowerCase();
  res.json({ correct, correctAnswer: String(expected) });
});

module.exports = router;

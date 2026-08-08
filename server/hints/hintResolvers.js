/**
 * HINT ANSWER RESOLVERS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Each concept can register an "answerResolver" function that, given the
 * raw question data, computes the canonical worked-example answer.
 * Used by the L3 explanation generator to fill in a real solution instead
 * of an empty "Answer: " placeholder.
 *
 * Pattern matches hintSpecs.js — adding a concept is a single entry.
 *
 *   sets:    resolver(questionData) → { workedSolution: string, correctAnswer: any }
 *   ratio:   ...
 *
 * Concepts without a resolver fall back to whatever's already in the
 * `answerData` passed to /api/hints/unlock. If neither is present, the
 * generator shows "Answer: (already shown above)" instead of blank.
 */

const fs = require('fs');
const path = require('path');

const _H = (strings, ...values) => strings.reduce(
  (acc, s, i) => acc + s + (i < values.length ? values[i] : ''), ''
);

let cachedVocabQuestions = null;
function getVocabQuestion(id, word) {
  if (!cachedVocabQuestions) {
    try {
      const vocabDir = path.join(__dirname, '..', '..', 'vocab', 'questions');
      const files = fs.readdirSync(vocabDir).filter((f) => f.endsWith('.json'));
      cachedVocabQuestions = files.map((f) => JSON.parse(fs.readFileSync(path.join(vocabDir, f), 'utf8')));
    } catch (e) {
      cachedVocabQuestions = [];
    }
  }
  const match = cachedVocabQuestions.find(q => {
    if (Number(q.id) !== Number(id)) return false;
    if (word && (q.word || q.question) !== word) return false;
    return true;
  });
  if (match) return match;
  return cachedVocabQuestions.find(q => Number(q.id) === Number(id));
}

let cachedGkQuestions = null;
function getGkQuestion(id, questionText) {
  if (!cachedGkQuestions) {
    try {
      const questionsDir = path.join(__dirname, '..', '..', 'chitragupta', 'questions');
      const files = fs.readdirSync(questionsDir).filter((f) => f.endsWith('.json'));
      cachedGkQuestions = files.map((f) => JSON.parse(fs.readFileSync(path.join(questionsDir, f), 'utf8')));
    } catch (e) {
      cachedGkQuestions = [];
    }
  }
  const match = cachedGkQuestions.find(q => {
    if (Number(q.id) !== Number(id)) return false;
    if (questionText && q.question !== questionText) return false;
    return true;
  });
  if (match) return match;
  return cachedGkQuestions.find(q => Number(q.id) === Number(id));
}

/**
 * Parse a set literal like "{1, 2, 3}" or "1,2,3" → array of numbers/strings.
 */
function parseSet(str) {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  const m = String(str).match(/\{([^}]+)\}/);
  if (!m) return String(str).split(',').map(s => s.trim()).filter(Boolean);
  return m[1].split(',').map(s => s.trim()).filter(Boolean).map(s => {
    const n = Number(s);
    return isNaN(n) ? s : n;
  });
}

const RESOLVERS = {
  // ── Sets ───────────────────────────────────────────────────────────────
  sets: (b) => {
    if (!b) return null;
    const U = parseSet(b.U);
    const A = parseSet(b.A);
    const B = parseSet(b.B);
    const C = parseSet(b.C);
    const setA = new Set(A), setB = new Set(B), setC = new Set(C);
    const setU = new Set(U);
    let result, method, label;

    // The prompt usually hints at the operation.
    const prompt = (b.prompt || '').toLowerCase();
    if (prompt.includes("a ∩ b") || prompt.includes("a ∩ b")) {
      result = A.filter(x => setB.has(x));
      method = 'intersection';
      label = 'A ∩ B';
    } else if (prompt.includes("a ∪ b") || prompt.includes("a ∪ b")) {
      result = [...new Set([...A, ...B])].sort((a, b) => a - b);
      method = 'union';
      label = 'A ∪ B';
    } else if (prompt.includes("a'") || prompt.includes("complement of a") || prompt.includes("a^c")) {
      result = [...setU].filter(x => !setA.has(x)).sort((a, b) => a - b);
      method = 'complement';
      label = `A'`;
    } else if (prompt.includes("a - b") || prompt.includes("a \\ b")) {
      result = A.filter(x => !setB.has(x));
      method = 'difference';
      label = 'A − B';
    } else if (prompt.includes("a △ b") || prompt.includes("symmetric")) {
      result = [...new Set([...A.filter(x => !setB.has(x)), ...B.filter(x => !setA.has(x))])].sort((a, b) => a - b);
      method = 'symmetric difference';
      label = 'A △ B';
    } else if (prompt.includes("|a|") || prompt.includes("cardinality")) {
      result = A.length;
      method = 'cardinality';
      label = '|A|';
    } else if (b.type === 'list' && b.answer) {
      // List problem — just use the answer if present
      return {
        correctAnswer: b.answer,
        workedSolution: _H`List out the elements as shown. The answer is {${JSON.stringify(b.answer)}}.`,
      };
    } else {
      return null; // unknown — fall through
    }

    const fmtResult = Array.isArray(result)
      ? `{${result.join(', ')}}`
      : String(result);
    return {
      correctAnswer: result,
      workedSolution: _H`**Method:** ${method} (${label})\n\n` +
        _H`**Step 1:** Identify the elements in each set.\n` +
        _H`  A = {${A.join(', ')}}\n` +
        (B.length ? _H`  B = {${B.join(', ')}}\n` : '') +
        _H`**Step 2:** Apply the operation.\n` +
        _H`**Result:** ${fmtResult}`,
    };
  },

  // ── Sequences ──────────────────────────────────────────────────────────
  sequences: (b) => {
    if (!b) return null;
    const a1 = Number(b.a);
    const d = Number(b.d);
    const r = Number(b.r);
    const n = Number(b.n);
    const prompt = (b.prompt || '').toLowerCase();

    if (b.type && b.type.startsWith('arith') && n) {
      const nth = a1 + (n - 1) * d;
      return {
        correctAnswer: nth,
        workedSolution: _H`**Type:** Arithmetic sequence (common difference d = ${d})\n\n` +
          _H`**Formula:** aₙ = a₁ + (n − 1) × d\n\n` +
          _H`**Step 1:** Plug in a₁ = ${a1}, n = ${n}, d = ${d}\n` +
          _H`  aₙ = ${a1} + (${n} − 1) × ${d}\n` +
          _H`  aₙ = ${a1} + ${(n - 1) * d}\n\n` +
          _H`**Result:** a${n} = ${nth}`,
      };
    }
    if (b.type && b.type.startsWith('geom') && n && r) {
      const nth = a1 * Math.pow(r, n - 1);
      return {
        correctAnswer: nth,
        workedSolution: _H`**Type:** Geometric sequence (common ratio r = ${r})\n\n` +
          _H`**Formula:** aₙ = a₁ × rⁿ⁻¹\n\n` +
          _H`**Step 1:** Plug in a₁ = ${a1}, r = ${r}, n = ${n}\n` +
          _H`  aₙ = ${a1} × ${r}^${n - 1}\n` +
          _H`  aₙ = ${a1} × ${Math.pow(r, n - 1)}\n\n` +
          _H`**Result:** a${n} = ${nth}`,
      };
    }
    return null;
  },

  // ── Ratio ──────────────────────────────────────────────────────────────
  ratio: (b) => {
    if (!b) return null;
    const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
    if (b.type === 'simplify' && b.a && b.b) {
      const g = gcd(Number(b.a), Number(b.b));
      const a2 = Number(b.a) / g, b2 = Number(b.b) / g;
      return {
        correctAnswer: `${a2}:${b2}`,
        workedSolution: _H`**Method:** Divide both sides by their GCD\n\n` +
          _H`**Step 1:** Find GCD(${b.a}, ${b.b}) = ${g}\n` +
          _H`**Step 2:** ${b.a} ÷ ${g} = ${a2},  ${b.b} ÷ ${g} = ${b2}\n\n` +
          _H`**Result:** ${a2} : ${b2}`,
      };
    }
    if ((b.type === 'divide2' || b.type === 'divide3') && b.total) {
      const parts = (b.type === 'divide2')
        ? [Number(b.r1), Number(b.r2)]
        : [Number(b.r1), Number(b.r2), Number(b.r3)];
      const sum = parts.reduce((a, c) => a + c, 0);
      const share = Number(b.total) / sum;
      const shares = parts.map(p => p * share);
      return {
        correctAnswer: shares.join(' : '),
        workedSolution: _H`**Method:** Divide in ratio ${parts.join(' : ')}\n\n` +
          _H`**Step 1:** Sum of ratio parts = ${sum}\n` +
          _H`**Step 2:** One share = ${b.total} ÷ ${sum} = ${share}\n` +
          _H`**Step 3:** Each part = ratio × share\n` +
          parts.map((p, i) => _H`  ${p} × ${share} = ${shares[i]}\n`).join('') +
          _H`\n**Result:** ${shares.join(' : ')}`,
      };
    }
    if (b.type === 'direct' && b.a && b.b && b.c) {
      const d = (Number(b.b) * Number(b.c)) / Number(b.a);
      return {
        correctAnswer: d,
        workedSolution: _H`**Method:** Direct proportion (cross-multiply)\n\n` +
          _H`If ${b.a}:${b.b} = ${b.c}:d, then ${b.a} × d = ${b.b} × ${b.c}\n` +
          _H`d = (${b.b} × ${b.c}) ÷ ${b.a} = ${d}`,
      };
    }
    return null;
  },

  // ── Percent ────────────────────────────────────────────────────────────
  percent: (b) => {
    if (!b) return null;
    if (b.type === 'simple' || b.pct !== undefined && b.base !== undefined) {
      const pct = Number(b.pct ?? b.percent);
      const base = Number(b.base ?? b.number);
      const result = (pct / 100) * base;
      return {
        correctAnswer: result,
        workedSolution: _H`**Formula:** x% of y = (x ÷ 100) × y\n\n` +
          _H`**Step:** ${pct}% of ${base} = (${pct} ÷ 100) × ${base} = ${result}`,
      };
    }
    if (b.type === 'find_pct' && b.part !== undefined && b.whole !== undefined) {
      const pct = (Number(b.part) / Number(b.whole)) * 100;
      return {
        correctAnswer: pct,
        workedSolution: _H`**Formula:** % = (part ÷ whole) × 100\n\n` +
          _H`**Step:** (${b.part} ÷ ${b.whole}) × 100 = ${pct}%`,
      };
    }
    if (b.type === 'inc_dec' && b.original !== undefined) {
      const op = b.op === 'inc' ? 1 : -1;
      const result = Number(b.original) * (1 + op * Number(b.rate) / 100);
      return {
        correctAnswer: result,
        workedSolution: _H`**Formula:** New = Original × (1 ${op > 0 ? '+' : '−'} rate ÷ 100)\n\n` +
          _H`**Step:** ${b.original} × (1 ${op > 0 ? '+' : '−'} ${b.rate}/100) = ${result}`,
      };
    }
    if (b.type === 'reverse' && b.newValue !== undefined) {
      const op = b.op === 'inc' ? 1 : -1;
      const result = Number(b.newValue) / (1 + op * Number(b.rate) / 100);
      return {
        correctAnswer: result,
        workedSolution: _H`**Formula:** Original = New ÷ (1 ${op > 0 ? '+' : '−'} rate ÷ 100)\n\n` +
          _H`**Step:** ${b.newValue} ÷ (1 ${op > 0 ? '+' : '−'} ${b.rate}/100) = ${result}`,
      };
    }
    if (b.type === 'compound' && b.principal !== undefined) {
      const A = Number(b.principal) * Math.pow(1 + Number(b.rate) / 100, Number(b.n));
      return {
        correctAnswer: A,
        workedSolution: _H`**Formula:** A = P(1 + r/100)ⁿ\n\n` +
          _H`**Step:** A = ${b.principal} × (1 + ${b.rate}/100)^${b.n} = ${A.toFixed(2)}`,
      };
    }
    return null;
  },

  // ── Indices ────────────────────────────────────────────────────────────
  indices: (b) => {
    if (!b) return null;
    const base = b.base ?? 'a';
    if (b.subtype === 'multiply' && b.m !== undefined && b.n !== undefined) {
      return {
        correctAnswer: `${base}^${Number(b.m) + Number(b.n)}`,
        workedSolution: _H`**Law:** aᵐ × aⁿ = aᵐ⁺ⁿ\n\n` +
          _H`**Step:** ${base}${sup(b.m)} × ${base}${sup(b.n)} = ${base}${sup(Number(b.m) + Number(b.n))}`,
      };
    }
    if (b.subtype === 'divide' && b.m !== undefined && b.n !== undefined) {
      const exp = Number(b.m) - Number(b.n);
      return {
        correctAnswer: `${base}^${exp}`,
        workedSolution: _H`**Law:** aᵐ ÷ aⁿ = aᵐ⁻ⁿ\n\n` +
          _H`**Step:** ${base}${sup(b.m)} ÷ ${base}${sup(b.n)} = ${base}${sup(exp)}`,
      };
    }
    if (b.subtype === 'power' && b.m !== undefined && b.n !== undefined) {
      return {
        correctAnswer: `${base}^${Number(b.m) * Number(b.n)}`,
        workedSolution: _H`**Law:** (aᵐ)ⁿ = aᵐⁿ\n\n` +
          _H`**Step:** (${base}${sup(b.m)})${sup(b.n)} = ${base}${sup(Number(b.m) * Number(b.n))}`,
      };
    }
    if (b.subtype === 'zero') {
      return {
        correctAnswer: '1',
        workedSolution: _H`**Law:** a⁰ = 1 (for any a ≠ 0)\n\n` +
          _H`**Result:** ${base}⁰ = 1`,
      };
    }
    if (b.subtype === 'negative' && b.m !== undefined) {
      return {
        correctAnswer: `1/${base}^${b.m}`,
        workedSolution: _H`**Law:** a⁻ⁿ = 1/aⁿ\n\n` +
          _H`**Result:** ${base}${sup('-' + b.m)} = 1/${base}${sup(b.m)}`,
      };
    }
    if (b.subtype === 'fractional' && b.m !== undefined && b.n !== undefined) {
      return {
        correctAnswer: `${b.n}√${base}^${b.m}`,
        workedSolution: _H`**Law:** a^(m/n) = ⁿ√(aᵐ)\n\n` +
          _H`**Result:** ${base}^(${b.m}/${b.n}) = ${b.n}√${base}${sup(b.m)}`,
      };
    }
    return null;
  },

  // ── Surds ──────────────────────────────────────────────────────────────
  surds: (b) => {
    if (!b) return null;
    // Simplify √n where n = a² × b
    if (b.type === 'simplify' && b.n) {
      const n = Number(b.n);
      let a = 1, r = n;
      for (let k = Math.floor(Math.sqrt(n)); k >= 2; k--) {
        if (n % (k * k) === 0) { a = k; r = n / (k * k); break; }
      }
      const result = r === 1 ? String(a) : (a === 1 ? `√${r}` : `${a}√${r}`);
      return {
        correctAnswer: result,
        workedSolution: _H`**Method:** Factor out the largest perfect square from √${n}\n\n` +
          _H`**Step 1:** Find the biggest square factor of ${n} → ${a * a} (= ${a}²)\n` +
          _H`**Step 2:** √(${a * a} × ${r}) = √${a * a} × √${r} = ${a}√${r}\n\n` +
          _H`**Result:** ${result}`,
      };
    }
    if (b.type === 'addsub' && b.a && b.b && b.r) {
      const result = b.op === '+' ? Number(b.a) + Number(b.b) : Number(b.a) - Number(b.b);
      const resultStr = result === 0 ? '0' : (result === 1 ? `√${b.r}` : (result < 0 ? `−${Math.abs(result)}√${b.r}` : `${result}√${b.r}`));
      return {
        correctAnswer: resultStr,
        workedSolution: _H`**Method:** Like terms in surds\n\n` +
          _H`**Step:** ${b.a}√${b.r} ${b.op} ${b.b}√${b.r} = (${b.a} ${b.op} ${b.b})√${b.r} = ${result}√${b.r}\n\n` +
          _H`**Result:** ${resultStr}`,
      };
    }
    return null;
  },

  // ── Addition ───────────────────────────────────────────────────────────
  addition: (b) => {
    if (!b) return null;
    const ans = Number(b.a) + Number(b.b);
    return {
      correctAnswer: ans,
      workedSolution: `${b.a} + ${b.b} = ${ans}`,
    };
  },

  // ── Basic Arithmetic ───────────────────────────────────────────────────
  basicarith: (b) => {
    if (!b) return null;
    const { a, b: num2, op } = b;
    let correctAnswer;
    const cleanOp = String(op || '+').replace('−', '-').replace('×', '*').replace('÷', '/');
    if (cleanOp === '+') correctAnswer = Number(a) + Number(num2);
    else if (cleanOp === '-') correctAnswer = Number(a) - Number(num2);
    else if (cleanOp === '*') correctAnswer = Number(a) * Number(num2);
    else if (cleanOp === '/') correctAnswer = Number(num2) === 0 ? NaN : Number(a) / Number(num2);
    else correctAnswer = NaN;
    return {
      correctAnswer,
      workedSolution: `${a} ${op} ${num2} = ${correctAnswer}`,
    };
  },

  // ── HCF & LCM ──────────────────────────────────────────────────────────
  hcflcm: (b) => {
    if (!b || !b.prompt) return null;
    const nums = b.prompt.match(/\d+/g);
    if (!nums || nums.length < 2) return null;

    const getPrimeFactors = (num) => {
      let n = num;
      const factors = [];
      for (let i = 2; i <= n; i++) {
        while (n % i === 0) {
          factors.push(i);
          n /= i;
        }
      }
      return factors;
    };

    const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
    const lcm = (x, y) => (x * y) / gcd(x, y);

    const isLcm = b.prompt.toLowerCase().includes('lcm') || b.prompt.toLowerCase().includes('minutes') || b.prompt.toLowerCase().includes('depart');
    if (!isLcm) {
      const n1 = Number(nums[0]);
      const n2 = Number(nums[1]);
      const ans = gcd(n1, n2);
      const p1 = getPrimeFactors(n1);
      const p2 = getPrimeFactors(n2);
      
      return {
        correctAnswer: ans,
        workedSolution: `**Method:** Find the Highest Common Factor (HCF) using prime factorization.\n\n` +
          `**Step 1:** Write the prime factorizations:\n` +
          `  ${n1} = ${p1.join(' × ')}\n` +
          `  ${n2} = ${p2.join(' × ')}\n\n` +
          `**Step 2:** Identify the common prime factors and multiply them:\n` +
          `  HCF = ${ans}`,
      };
    } else {
      const n1 = Number(nums[0]);
      const n2 = Number(nums[1]);
      const p1 = getPrimeFactors(n1);
      const p2 = getPrimeFactors(n2);
      
      if (nums.length >= 3 && b.prompt.toLowerCase().includes('lcm') && b.prompt.includes(',')) {
        const n3 = Number(nums[2]);
        const p3 = getPrimeFactors(n3);
        const ans = lcm(lcm(n1, n2), n3);
        
        return {
          correctAnswer: ans,
          workedSolution: `**Method:** Find the Lowest Common Multiple (LCM) of three numbers.\n\n` +
            `**Step 1:** Write the prime factorizations:\n` +
            `  ${n1} = ${p1.join(' × ')}\n` +
            `  ${n2} = ${p2.join(' × ')}\n` +
            `  ${n3} = ${p3.join(' × ')}\n\n` +
            `**Step 2:** Find the highest power of each prime factor and multiply:\n` +
            `  LCM = ${ans}`,
        };
      } else {
        const ans = lcm(n1, n2);
        return {
          correctAnswer: ans,
          workedSolution: `**Method:** Find the Lowest Common Multiple (LCM) using prime factorization.\n\n` +
            `**Step 1:** Write the prime factorizations:\n` +
            `  ${n1} = ${p1.join(' × ')}\n` +
            `  ${n2} = ${p2.join(' × ')}\n\n` +
            `**Step 2:** Take the highest power of all prime factors appearing in either number:\n` +
            `  LCM = ${ans}`,
        };
      }
    }
  },

  // ── Vocab ──────────────────────────────────────────────────────────────
  vocab: (b) => {
    if (!b || !b.id) return null;
    const q = getVocabQuestion(b.id, b.word || b.question);
    if (!q) return null;
    return {
      correctAnswer: q.answerOption,
      correctAnswerText: `${q.answerOption}) ${q.answerText}`,
      workedSolution: `The correct answer is: ${q.answerOption}) ${q.answerText}\n\nTip: Read all options carefully before choosing.`,
    };
  },

  // ── GK ─────────────────────────────────────────────────────────────────
  gk: (b) => {
    if (!b || !b.id) return null;
    const q = getGkQuestion(b.id, b.question);
    if (!q) return null;
    return {
      correctAnswer: q.answerOption,
      correctAnswerText: `${q.answerOption}) ${q.answerText}`,
      workedSolution: `The correct answer is: ${q.answerOption}) ${q.answerText}\n\nTip: Read all options carefully before choosing.`,
    };
  },
};

/**
 * Convert a number to a superscript string (for exponents).
 */
function sup(n) {
  const supDigits = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(n).split('').map(c => supDigits[c] || c).join('');
}

/**
 * Resolve a worked-example solution for the given concept + questionData.
 * Returns null if the concept has no resolver or the data is unrecognisable.
 */
function resolveAnswer(concept, questionData) {
  const normalized = (concept || '').toLowerCase().trim();
  const gymMapping = {
    gymdecimals: 'decimals',
    funcgym: 'funceval',
    dotprodgym: 'dotprod',
    fracaddgym: 'fractionadd',
    lineqgym: 'lineq',
    indicesgym: 'indices',
    polygym: 'polymul'
  };
  const mapped = gymMapping[normalized] || normalized;
  const resolverKey = Object.keys(RESOLVERS).find(k => k.toLowerCase() === mapped);
  const fn = RESOLVERS[resolverKey];
  if (!fn) return null;
  try {
    return fn(questionData);
  } catch (e) {
    console.error(`[hintResolvers] ${concept} resolver failed:`, e.message);
    return null;
  }
}

module.exports = { resolveAnswer, RESOLVERS };

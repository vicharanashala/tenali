'use strict';
// Arithmetic topic router: addition, multiply, basicarith, squaring, rounding, decimals
// Mounted in server/index.js via:
//   app.use('/addition-api', require('./routes/arithmetic'));
//   app.use('/multiply-api', require('./routes/arithmetic')); ... etc.
// The dispatcher reads req.baseUrl to identify the topic.

const router = require('express').Router();

// ── Shared utilities ────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function arithRange(difficulty) {
  if (difficulty === 'easy')      return { min: 1, max: 9 };
  if (difficulty === 'medium')    return { min: 10, max: 99 };
  if (difficulty === 'hard')      return { min: 100, max: 999 };
  if (difficulty === 'extrahard') return { min: 1000, max: 9999 };
  return { min: 1, max: 9 };
}

function roundHalfUp(value, dp = 0) {
  if (!isFinite(value) || value === 0) return value;
  const negative = value < 0;
  let s = Math.abs(value).toString();
  if (/e/i.test(s)) {
    s = Math.abs(value).toFixed(Math.max(20, dp + 5));
  }
  let [intStr, decStr = ''] = s.split('.');
  if (dp >= 0) {
    if (decStr.length <= dp) return negative ? -parseFloat(s) : parseFloat(s);
    const keep = intStr + decStr.slice(0, dp);
    const checkDigit = parseInt(decStr[dp], 10);
    let resultDigits;
    if (checkDigit >= 5) {
      const incremented = (BigInt(keep) + 1n).toString();
      resultDigits = incremented.length >= keep.length
        ? incremented : incremented.padStart(keep.length, '0');
    } else {
      resultDigits = keep;
    }
    let resInt, resDec;
    if (dp === 0) {
      resInt = resultDigits; resDec = '';
    } else {
      resInt = resultDigits.slice(0, resultDigits.length - dp);
      resDec = resultDigits.slice(resultDigits.length - dp);
      if (resInt === '') resInt = '0';
    }
    return parseFloat((negative ? '-' : '') + resInt + (resDec ? '.' + resDec : ''));
  } else {
    const removeCount = -dp;
    const padded = intStr.padStart(removeCount + 1, '0');
    const keep = padded.slice(0, padded.length - removeCount);
    const dropFirst = padded[padded.length - removeCount];
    const resultInt = parseInt(dropFirst, 10) >= 5
      ? (BigInt(keep) + 1n).toString() : keep;
    return parseFloat((negative ? '-' : '') + resultInt + '0'.repeat(removeCount));
  }
}

function roundSigFigs(value, sf) {
  if (!isFinite(value) || value === 0) return value;
  const mag = Math.floor(Math.log10(Math.abs(value)));
  return roundHalfUp(value, sf - mag - 1);
}

function digitRange(digits) {
  if (digits === 1) return { min: 0, max: 9 };
  if (digits === 2) return { min: 10, max: 99 };
  if (digits === 3) return { min: 100, max: 999 };
  return { min: 1000, max: 9999 };
}

function bandForStep(step) {
  if (step <= 10) return { min: 2, max: 50 };
  if (step <= 20) return { min: 51, max: 150 };
  if (step <= 35) return { min: 151, max: 350 };
  if (step <= 60) return { min: 351, max: 700 };
  return { min: 701, max: 999 };
}

function computeColumnData(a, b) {
  const sum = a + b;
  const aStr = String(a);
  const bStr = String(b);
  const sStr = String(sum);
  const opLen = Math.max(aStr.length, bStr.length);
  const ansLen = sStr.length;
  // Pad operands to ansLen so they align with answer columns
  const aPad = aStr.padStart(ansLen, ' ');
  const bPad = bStr.padStart(ansLen, ' ');
  // carries[i] = carry INTO position i of the answer
  // carries[0] is always 0 (ones column has no carry in)
  const carries = new Array(ansLen).fill(0);
  let carry = 0;
  for (let i = ansLen - 1; i >= 0; i--) {
    const da = parseInt(aPad[i]) || 0;
    const db = parseInt(bPad[i]) || 0;
    const colSum = da + db + carry;
    carry = colSum >= 10 ? 1 : 0;
    if (i > 0) carries[i - 1] = carry;
  }
  const answerDigits = sStr.split('').map(Number);
  const aDigits = aPad.split('').map(d => d === ' ' ? null : Number(d));
  const bDigits = bPad.split('').map(d => d === ' ' ? null : Number(d));
  return { answerDigits, aDigits, bDigits, carries, digits: opLen };
}

function computeMulData(multiplicand, multiplier) {
  const aStr = String(multiplicand);
  const bStr = String(multiplier);
  const aLen = aStr.length;
  const bLen = bStr.length;
  const product = multiplicand * multiplier;
  const pStr = String(product);
  const ansLen = pStr.length;
  const aDigits = aStr.split('').map(Number);
  const bDigits = bStr.split('').map(Number);

  if (bLen === 1) {
    const m = bDigits[0];
    const aPad = aStr.padStart(ansLen, ' ');
    const carries = new Array(ansLen).fill(0);
    let carry = 0;
    for (let i = ansLen - 1; i >= 0; i--) {
      const da = parseInt(aPad[i]) || 0;
      const colProd = da * m + carry;
      carry = Math.floor(colProd / 10);
      if (i > 0) carries[i - 1] = carry;
    }
    const answerDigits = pStr.split('').map(Number);
    const aDigitsPadded = aPad.split('').map(d => d === ' ' ? null : Number(d));
    return { answerDigits, aDigits: aDigitsPadded, carries, digits: aLen, multiDigitMultiplier: false };
  }

  const partialProducts = [];
  for (let bi = bLen - 1; bi >= 0; bi--) {
    const bDigit = bDigits[bi];
    const shift = bLen - 1 - bi;
    const pp = multiplicand * bDigit;
    const ppStr = String(pp);
    const ppLen = ppStr.length;
    const carries = new Array(ppLen).fill(null);
    let carry = 0;
    for (let i = ppLen - 1; i >= 0; i--) {
      const ai = aLen - 1 - (ppLen - 1 - i);
      const da = ai >= 0 ? aDigits[ai] : 0;
      const total = da * bDigit + carry;
      carry = Math.floor(total / 10);
      if (i > 0) carries[i - 1] = carry;
    }
    const paddedDigits = new Array(ansLen).fill(null);
    const paddedCarries = new Array(ansLen).fill(null);
    const startCol = ansLen - ppLen - shift;
    for (let j = 0; j < ppLen; j++) {
      const col = startCol + j;
      if (col >= 0 && col < ansLen) {
        paddedDigits[col] = Number(ppStr[j]);
        paddedCarries[col] = carries[j];
      }
    }
    partialProducts.push({ multiplierDigit: bDigit, digits: paddedDigits, carries: paddedCarries });
  }

  return {
    answerDigits: pStr.split('').map(Number),
    aDigits, bDigits, digits: aLen,
    multiDigitMultiplier: true, partialProducts, ansLen
  };
}

function computeColumnDivision(dividend, divisor) {
  const dStr = String(dividend);
  const dividendDigits = dStr.split('').map(Number);
  const divisorDigits = String(divisor).split('').map(Number);
  const steps = [];
  const quotientDigits = [];
  let current = 0;
  let firstQuotientCol = -1;
  for (let i = 0; i < dividendDigits.length; i++) {
    current = current * 10 + dividendDigits[i];
    if (current >= divisor || quotientDigits.length > 0) {
      if (firstQuotientCol === -1) firstQuotientCol = i;
      const q = Math.floor(current / divisor);
      const product = q * divisor;
      const remainder = current - product;
      quotientDigits.push(q);
      const isLast = quotientDigits.length === dividendDigits.length - firstQuotientCol;
      const nextDigit = (i + 1 < dividendDigits.length) ? dividendDigits[i + 1] : null;
      steps.push({ product, remainder, current, isLast, nextDigit });
      current = remainder;
    }
  }
  if (quotientDigits.length === 0) {
    quotientDigits.push(0);
    firstQuotientCol = 0;
    steps.push({ product: 0, remainder: dividend, current: dividend, isLast: true, nextDigit: null });
  }
  return {
    quotientDigits,
    dividendDigits,
    divisorDigits,
    steps,
    firstQuotientCol,
    digits: dStr.length,
  };
}

function computeSubData(minuend, subtrahend) {
  const diff = minuend - subtrahend;
  const aStr = String(minuend);
  const bStr = String(subtrahend);
  const dStr = String(diff);
  const len = Math.max(aStr.length, bStr.length, dStr.length);
  // Pad ALL THREE rows (minuend, subtrahend, difference) to the SAME length
  // so column i in every row aligns vertically above the answer digit at column i.
  const aPad = aStr.padStart(len, ' ');
  const bPad = bStr.padStart(len, ' ');
  const dPad = dStr.padStart(len, ' ');
  // convertedTop[i] = the top digit in column i AFTER all borrows have been worked through.
  // Paper-style: child strikes out the original digit and writes the converted value above.
  // e.g. for 23−18, convertedTop = [1, 13]  (tens "2" becomes "1" after lending; ones "3" becomes "13")
  // String values like "13", "12", "11", "9" mean "this column now holds a 2-digit-or-cascaded value".
  const workTop = aPad.split('').map(d => d === ' ' ? 0 : Number(d));
  const convertedTop = new Array(len).fill(0);
  for (let i = len - 1; i >= 0; i--) {
    const db = parseInt(bPad[i]) || 0;
    let top = workTop[i];
    if (top < db) {
      let k = i - 1;
      while (k >= 0 && workTop[k] === 0) k--;
      if (k >= 0) {
        workTop[k] -= 1;
        for (let j = k + 1; j < i; j++) workTop[j] = 9;
        top += 10;
      }
    }
    convertedTop[i] = top;
  }
  const answerDigits = dPad.split('').map(Number);
  const aDigits = aPad.split('').map(d => d === ' ' ? null : Number(d));
  const bDigits = bPad.split('').map(d => d === ' ' ? null : Number(d));
  return { answerDigits, aDigits, bDigits, borrows: convertedTop, digits: len };
}

// ── Topic generators ────────────────────────────────────────────────────────

const generators = {

  'column-addition': {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const digitMap = { easy: 1, medium: 2, hard: 3, extrahard: 4 };
      const numDigits = digitMap[difficulty] || 1;
      const range = digitRange(numDigits);
      let a, b, data;
      let attempts = 0;
      do {
        a = randomInt(Math.max(range.min, 1), range.max);
        b = randomInt(Math.max(range.min, 1), range.max);
        data = computeColumnData(a, b);
        attempts++;
      } while (data.carries.slice(1).every(c => c === 0) && attempts < 20);
      return {
        id: `ca-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        a, b,
        answer: a + b,
        prompt: `Add ${a} + ${b} in column format`,
        ...data,
      };
    },
    check(body) {
      const { a, b, userAnswer, userCarries } = body || {};
      const numA = Number(a), numB = Number(b);
      const correctAnswer = numA + numB;
      const data = computeColumnData(numA, numB);
      const answerCorrect = Array.isArray(userAnswer) &&
        userAnswer.map(Number).join('') === data.answerDigits.join('');
      const carriesCorrect = Array.isArray(userCarries) &&
        userCarries.map(Number).join('') === data.carries.join('');
      const correct = answerCorrect && carriesCorrect;
      return {
        correct,
        correctAnswer,
        answerDigits: data.answerDigits,
        correctCarries: data.carries,
        message: correct ? 'Correct!' : carriesCorrect ? 'Answer digits wrong' : answerCorrect ? 'Carries wrong' : 'Try again',
      };
    },
  },

  'column-multiplication': {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      let a, m, data;
      let attempts = 0;
      if (difficulty === 'hard') {
        const aRange = digitRange(2), bRange = digitRange(2);
        do {
          a = randomInt(Math.max(aRange.min, 10), aRange.max);
          m = randomInt(Math.max(bRange.min, 10), bRange.max);
          data = computeMulData(a, m);
          attempts++;
        } while (attempts < 30 && data.partialProducts.every(pp => pp.carries.every(c => c === null || c === 0)));
      } else if (difficulty === 'extrahard') {
        const coin = Math.random() < 0.5;
        const aDig = coin ? 3 : 4, bDig = 3;
        const aRange = digitRange(aDig), bRange = digitRange(bDig);
        do {
          a = randomInt(Math.max(aRange.min, Math.pow(10, aDig - 1)), aRange.max);
          m = randomInt(Math.max(bRange.min, Math.pow(10, bDig - 1)), bRange.max);
          data = computeMulData(a, m);
          attempts++;
        } while (attempts < 30 && data.partialProducts.every(pp => pp.carries.every(c => c === null || c === 0)));
      } else {
        const digitMap = { easy: 1, medium: 2 };
        const numDigits = digitMap[difficulty] || 1;
        const range = digitRange(numDigits);
        do {
          a = randomInt(Math.max(range.min, 1), range.max);
          m = randomInt(2, 9);
          data = computeMulData(a, m);
          attempts++;
        } while (data.carries.slice(1).every(c => c === 0) && attempts < 20);
      }
      return {
        id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        a, b: m,
        multiplier: m,
        answer: a * m,
        ...data,
      };
    },
    check(body) {
      const { a, b, userAnswer, userCarries, userPartialProducts } = body || {};
      const numA = Number(a), numB = Number(b);
      const correctAnswer = numA * numB;
      const data = computeMulData(numA, numB);

      if (data.multiDigitMultiplier && Array.isArray(userPartialProducts)) {
        let answerCorrect = Array.isArray(userAnswer) &&
          userAnswer.map(Number).join('') === data.answerDigits.join('');
        let ppCorrect = true;
        let carriesCorrect = true;
        for (let pi = 0; pi < data.partialProducts.length; pi++) {
          const up = Array.isArray(userPartialProducts[pi]) ? userPartialProducts[pi] : [];
          const uc = Array.isArray(userCarries) && Array.isArray(userCarries[pi]) ? userCarries[pi] : [];
          const cp = data.partialProducts[pi].digits;
          const cc = data.partialProducts[pi].carries;
          const userPpJoined = up.map(v => v === null || v === undefined || v === '' ? '_' : v).join('');
          const correctPpJoined = cp.map(v => v === null ? '_' : v).join('');
          const userCarrJoined = uc.map(v => v === null || v === undefined || v === '' ? '_' : v).join('');
          const correctCarrJoined = cc.map(v => v === null ? '_' : v).join('');
          if (userPpJoined !== correctPpJoined) ppCorrect = false;
          if (userCarrJoined !== correctCarrJoined) carriesCorrect = false;
        }
        const correct = answerCorrect && ppCorrect && carriesCorrect;
        return {
          correct,
          correctAnswer,
          answerDigits: data.answerDigits,
          partialProducts: data.partialProducts,
          multiDigitMultiplier: true,
          message: correct ? 'Correct!'
            : !ppCorrect ? 'Partial product digits wrong'
            : !carriesCorrect ? 'Carries wrong'
            : 'Answer wrong',
        };
      }

      const answerCorrect = Array.isArray(userAnswer) &&
        userAnswer.map(Number).join('') === data.answerDigits.join('');
      const carriesCorrect = Array.isArray(userCarries) &&
        userCarries.map(Number).join('') === data.carries.join('');
      const correct = answerCorrect && carriesCorrect;
      return {
        correct,
        correctAnswer,
        answerDigits: data.answerDigits,
        correctCarries: data.carries,
        message: correct ? 'Correct!' : carriesCorrect ? 'Product digits wrong' : answerCorrect ? 'Carries wrong' : 'Try again',
      };
    },
  },

  'column-division': {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const digitMap = { easy: [1, 3], medium: [1, 4], hard: [2, 4], extrahard: [2, 5] };
      const [divisorDigits, dividendDigits] = digitMap[difficulty] || [1, 3];
      const dRange = digitRange(divisorDigits);
      const mRange = digitRange(dividendDigits);
      const divisorMin = Math.max(dRange.min, 2);
      let dividend, divisor, data;
      let attempts = 0;
      do {
        divisor = randomInt(divisorMin, dRange.max);
        dividend = randomInt(Math.max(2 * divisor, divisor + 1), mRange.max);
        data = computeColumnDivision(dividend, divisor);
        attempts++;
      } while (data.steps.length < 2 && attempts < 50);
      return {
        id: `cd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        dividend,
        divisor,
        answer: Math.floor(dividend / divisor),
        quotientDigits: data.quotientDigits,
        dividendDigits: data.dividendDigits,
        divisorDigits: data.divisorDigits,
        firstQuotientCol: data.firstQuotientCol,
        steps: data.steps,
      };
    },
    check(body) {
      const { dividend, divisor, userQuotient, userProducts, userRemainders, solve, sessionGoal } = body || {};
      const numDividend = Number(dividend);
      const numDivisor = Number(divisor);
      const correctAnswer = Math.floor(numDividend / numDivisor);
      const data = computeColumnDivision(numDividend, numDivisor);

      if (solve) {
        const solutionSteps = data.steps.map((step, i) => ({
          stepNum: i + 1,
          partialDividend: step.current,
          divisor: numDivisor,
          quotientDigit: data.quotientDigits[i],
          product: step.product,
          difference: step.current - step.product,
          remainder: step.remainder,
          isLast: step.isLast,
          nextDigit: step.nextDigit,
        }));
        return {
          correct: false,
          answer: correctAnswer,
          display: `${numDividend} ÷ ${numDivisor} = ${correctAnswer}`,
          steps: data.steps,
          solutionSteps,
          quotientDigits: data.quotientDigits,
          dividendDigits: data.dividendDigits,
          divisorDigits: data.divisorDigits,
          firstQuotientCol: data.firstQuotientCol,
          explanation: `Long division: ${numDividend} ÷ ${numDivisor} = ${correctAnswer}${numDividend % numDivisor !== 0 ? ' R' + (numDividend % numDivisor) : ''}`,
        };
      }

      const answerCorrect = Array.isArray(userQuotient) &&
        userQuotient.length === data.quotientDigits.length &&
        userQuotient.every((d, i) => Number(d) === data.quotientDigits[i]);

      const productsCorrect = Array.isArray(userProducts) &&
        userProducts.length === data.steps.length &&
        userProducts.every((p, i) => Number(p) === data.steps[i].product);

      const remaindersCorrect = Array.isArray(userRemainders) &&
        userRemainders.length === data.steps.length &&
        userRemainders.every((r, i) => Number(r) === data.steps[i].remainder);

      const allCorrect = answerCorrect && productsCorrect && remaindersCorrect;
      let lilCoins = 0;
      if (allCorrect) lilCoins = 15;

      const solutionSteps = data.steps.map((step, i) => {
        const qDigit = data.quotientDigits[i];
        const bdStr = !step.isLast && step.nextDigit !== null ? ` → ${step.current * 10 + step.nextDigit}` : '';
        return {
          stepNum: i + 1,
          partialDividend: step.current,
          divisor: numDivisor,
          quotientDigit: qDigit,
          product: step.product,
          difference: step.current - step.product,
          remainder: step.remainder,
          bringDown: bdStr,
          isLast: step.isLast,
          nextDigit: step.nextDigit,
        };
      });

      return {
        correct: allCorrect,
        display: `${numDividend} ÷ ${numDivisor} = ${correctAnswer}${allCorrect ? ` (+${lilCoins} 🪙)` : ''}`,
        lil: allCorrect ? { coinsEarned: lilCoins } : null,
        explanation: allCorrect ? '' : `Correct: ${numDividend} ÷ ${numDivisor} = ${correctAnswer}${numDividend % numDivisor !== 0 ? ' R' + (numDividend % numDivisor) : ''}`,
        correctAnswer,
        steps: data.steps,
        solutionSteps,
        quotientDigits: data.quotientDigits,
        dividendDigits: data.dividendDigits,
        divisorDigits: data.divisorDigits,
        firstQuotientCol: data.firstQuotientCol,
        message: allCorrect ? '' : !answerCorrect ? 'Incorrect quotient' : !productsCorrect ? 'Incorrect product(s)' : 'Incorrect remainder(s)',
      };
    },
  },

  'column-subtraction': {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      // Subtraction needs at least 2 digits to have any borrows; bump easy to 2
      const digitMap = { easy: 2, medium: 2, hard: 3, extrahard: 4 };
      const numDigits = digitMap[difficulty] || 2;
      const range = digitRange(numDigits);
      let a, b, data;
      let attempts = 0;
      do {
        a = randomInt(Math.max(range.min, 10), range.max);
        b = randomInt(Math.max(range.min, 1), Math.max(a - 1, Math.max(range.min, 1)));
        data = computeSubData(a, b);
        attempts++;
      } while (data.borrows.slice(0, -1).every(x => x === 0) && attempts < 20);
      return {
        id: `cs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        a, b,
        answer: a - b,
        ...data,
      };
    },
    check(body) {
      const { a, b, userAnswer, userBorrows } = body || {};
      const numA = Number(a), numB = Number(b);
      const correctAnswer = numA - numB;
      const data = computeSubData(numA, numB);
      const aPad = String(numA).padStart(data.answerDigits.length, ' ');
      const answerCorrect = Array.isArray(userAnswer) &&
        userAnswer.map(v => v === '' || v == null ? -1 : Number(v)).join('') === data.answerDigits.join('');
      // For borrows: blank is OK when the converted top equals the original digit (no borrow happened)
      const borrowsCorrect = Array.isArray(userBorrows) &&
        userBorrows.every((raw, i) => {
          const v = (raw === '' || raw == null) ? '' : String(raw).trim();
          const expected = String(data.borrows[i]);
          const originalDigit = data.aDigits[i];
          const isOptional = originalDigit != null && expected === String(originalDigit);
          if (isOptional) return v === '' || v === expected;
          return v !== '' && v === expected;
        });
      const correct = answerCorrect && borrowsCorrect;
      return {
        correct,
        correctAnswer,
        answerDigits: data.answerDigits,
        correctBorrows: data.borrows,
        message: correct ? 'Correct!' : borrowsCorrect ? 'Difference digits wrong' : answerCorrect ? 'Borrow marks wrong' : 'Try again',
      };
    },
  },

  sqrt: {
    question(difficulty, query = {}) {
      // Support both 'step' (legacy) and 'difficulty' parameters
      // If difficulty is provided, map it to a step range
      let step;
      if (query.difficulty) {
        const d = query.difficulty;
        if (d === 'easy') step = randomInt(1, 5);
        else if (d === 'medium') step = randomInt(6, 10);
        else if (d === 'hard') step = randomInt(11, 20);
        else if (d === 'extrahard') step = randomInt(21, 50);
        else step = randomInt(1, 5); // Default to easy
      } else {
        step = Math.max(1, Number(query.step || 1));
      }

      const band = bandForStep(step);
      const q = randomInt(band.min, band.max);
      const sqrt = Math.sqrt(q);
      const floorAnswer = Math.floor(sqrt);
      const ceilAnswer = Math.ceil(sqrt);

      return {
        id: `${step}-${Date.now()}-${Math.random()}`,
        q,
        step,
        prompt: `√${q}`,
        floorAnswer,
        ceilAnswer,
        sqrtRounded: sqrt.toFixed(2),
      };
    },
    check(body) {
      const { q, answer } = body || {};
      const sqrt = Math.sqrt(Number(q));
      const floorAnswer = Math.floor(sqrt);
      const ceilAnswer = Math.ceil(sqrt);
      const numericAnswer = Number(answer);
      // Accept either floor or ceiling as correct
      const correct = numericAnswer === floorAnswer || numericAnswer === ceilAnswer;

      return {
        correct,
        floorAnswer,
        ceilAnswer,
        sqrtRounded: sqrt.toFixed(2),
        message: correct ? 'Correct' : 'Incorrect',
      };
    },
  },

  addition: {
    question(difficulty, opts = {}) {
      const digits = [1, 2, 3, 4].includes(Number(opts.digits)) ? Number(opts.digits) : 1;
      const ranges = { 1: { min: 0, max: 9 }, 2: { min: 10, max: 99 }, 3: { min: 100, max: 999 }, 4: { min: 1000, max: 9999 } };
      const range = ranges[digits];
      const sumMax = opts.sumMax ? Number(opts.sumMax) : null;
      const effectiveMax = sumMax ? Math.min(range.max, Math.floor(sumMax / 2)) : range.max;
      const effectiveMin = Math.min(range.min, effectiveMax);
      const a = randomInt(effectiveMin, effectiveMax);
      const b = randomInt(effectiveMin, effectiveMax);
      const additionTemplates = [
        `Alice has ${a} apples and Bob gives her ${b} more. How many apples does Alice have in total?`,
        `A store sold ${a} books in the morning and ${b} books in the afternoon. What is the total number of books sold?`,
        `You have $${a} in your savings account and you deposit $${b}. What is your new balance?`,
        `A farmer planted ${a} trees in the first week and ${b} trees in the second week. How many trees were planted in total?`,
        `${a} + ${b} = ?`,
      ];
      const prompt = additionTemplates[Math.floor(Math.random() * additionTemplates.length)];
      return { id: `${digits}-${Date.now()}-${Math.random()}`, digits, a, b, prompt, answer: a + b };
    },
    check(body) {
      const { a, b, answer } = body;
      const correctAnswer = Number(a) + Number(b);
      const correct = Number(answer) === correctAnswer;
      return { correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' };
    },
  },

  multiply: {
    question(difficulty, opts = {}) {
      const table = Math.max(1, Number(opts.table || 1));
      const multiplier = randomInt(1, 10);
      const answer = table * multiplier;
      return {
        id: `multiply-${Date.now()}-${Math.random()}`,
        table, multiplier,
        prompt: `${table} × ${multiplier}`,
        answer,
      };
    },
    check(body) {
      const { table, multiplier, answer } = body;
      const correctAnswer = Number(table) * Number(multiplier);
      const correct = Number(answer) === correctAnswer;
      return { correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' };
    },
  },

  basicarith: {
    question(difficulty) {
      const range = arithRange(difficulty);
      const ops = ['+', '−', '×', '÷'];
      const op = ops[randomInt(0, 3)];
      let a = randomInt(range.min, range.max);
      let b = randomInt(range.min, range.max);
      if (Math.random() < 0.4) a = -a;
      if (Math.random() < 0.4) b = -b;
      let answer;
      if (op === '+') answer = a + b;
      else if (op === '−') answer = a - b;
      else if (op === '×') answer = a * b;
      else {
        if (b === 0) b = 1;
        const qMag = Math.max(1, Math.min(Math.abs(range.max), 12));
        let q = randomInt(1, qMag);
        if (Math.random() < 0.4) q = -q;
        a = b * q;
        answer = q;
      }
      let prompt;
      if (op === '×' || op === '÷') prompt = `(${a}) ${op} (${b})`;
      else if (b < 0) prompt = `${a} ${op} (${b})`;
      else prompt = `${a} ${op} ${b}`;
      return { id: `arith-${Date.now()}-${Math.random()}`, a, b, op, prompt, answer };
    },
    check(body) {
      const { a, b, op, answer } = body;
      let correctAnswer;
      if (op === '+') correctAnswer = Number(a) + Number(b);
      else if (op === '−') correctAnswer = Number(a) - Number(b);
      else if (op === '×') correctAnswer = Number(a) * Number(b);
      else if (op === '÷') correctAnswer = Number(b) === 0 ? NaN : Number(a) / Number(b);
      else correctAnswer = NaN;
      const correct = Number(answer) === correctAnswer;
      return { correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' };
    },
  },

  squaring: {
    question(difficulty) {
      const id = Date.now();
      let lo, hi;
      if (difficulty === 'easy')        { lo = 11; hi = 29; }
      else if (difficulty === 'medium') { lo = 30; hi = 59; }
      else if (difficulty === 'hard')   { lo = 60; hi = 79; }
      else                              { lo = 80; hi = 99; }
      const n = randomInt(lo, hi);
      const a = Math.floor(n / 10) * 10;
      const b = n - a;
      const aSq = a * a, bSq = b * b, twoAB = 2 * a * b, answer = n * n;
      const prompt = `Find ${n}² using (${a} + ${b})²`;
      const display = `${n}² = ${a}² + 2·${a}·${b} + ${b}² = ${aSq} + ${twoAB} + ${bSq} = ${answer}`;
      return { id, difficulty, n, a, b, aSq, bSq, twoAB, answer, prompt, display };
    },
    check(body) {
      const { a, b, aSq, bSq, twoAB, answer, display } = body;
      const ua = (body.userAnswer || '').toString().replace(/\s/g, '');
      const parts = ua.split('|').map(s => parseInt(s.trim()));
      let correct = false;
      if (parts.length === 4) {
        correct = parts[0] === aSq && parts[1] === bSq && parts[2] === twoAB && parts[3] === answer;
      } else if (parts.length === 1 && !isNaN(parts[0])) {
        correct = parts[0] === answer;
      }
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  rounding: {
    question(difficulty) {
      let prompt, answer, display;
      if (difficulty === 'easy') {
        const dp = randomInt(1, 2);
        const num = (randomInt(100, 9999) / 1000).toFixed(4);
        answer = roundHalfUp(parseFloat(num), dp);
        display = answer.toFixed(dp);
        prompt = `Round ${num} to ${dp} decimal place${dp > 1 ? 's' : ''}.`;
      } else if (difficulty === 'medium') {
        const sf = randomInt(1, 3);
        const num = randomInt(1000, 99999) / (Math.pow(10, randomInt(0, 2)));
        const rounded = roundSigFigs(num, sf);
        answer = rounded; display = String(rounded);
        prompt = `Round ${num} to ${sf} significant figure${sf > 1 ? 's' : ''}.`;
      } else if (difficulty === 'hard') {
        const dp = randomInt(1, 3);
        const num = (randomInt(10000, 99999) / 10000).toFixed(5);
        const factor = Math.pow(10, dp);
        answer = Math.trunc(parseFloat(num) * factor) / factor;
        display = answer.toFixed(dp);
        prompt = `Truncate ${num} to ${dp} decimal place${dp > 1 ? 's' : ''}.`;
      } else {
        const a = randomInt(10, 99), b = randomInt(10, 99);
        const aRound = roundSigFigs(a, 1), bRound = roundSigFigs(b, 1);
        answer = aRound * bRound; display = String(answer);
        prompt = `Estimate ${a} × ${b} by rounding each number to 1 significant figure.`;
      }
      return { prompt, answer, display, difficulty };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/\s/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.005;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  decimals: {
    question(difficulty) {
      const id = `q-${Date.now()}-${Math.random()}`;
      if (difficulty === 'easy') {
        const a = (randomInt(1, 10) * 10 + randomInt(0, 9)) / 10;
        const b = (randomInt(1, 10) * 10 + randomInt(0, 9)) / 10;
        const answer = Math.round((a + b) * 100) / 100;
        return { id, difficulty, prompt: `${a.toFixed(1)} + ${b.toFixed(1)} = ?`, answer, display: answer.toFixed(1) };
      } else if (difficulty === 'medium') {
        let a = (randomInt(10, 100) + randomInt(0, 99) / 100);
        let b = (randomInt(10, 100) + randomInt(0, 99) / 100);
        if (a < b) [a, b] = [b, a];
        const answer = Math.round((a - b) * 100) / 100;
        return { id, difficulty, prompt: `${a.toFixed(2)} − ${b.toFixed(2)} = ?`, answer, display: answer.toFixed(2) };
      } else if (difficulty === 'hard') {
        const dec = (randomInt(10, 50) + randomInt(0, 99) / 100);
        const int = randomInt(2, 15);
        const answer = Math.round(dec * int * 100) / 100;
        return { id, difficulty, prompt: `${dec.toFixed(2)} × ${int} = ?`, answer, display: answer.toFixed(2) };
      } else {
        const a = (randomInt(20, 100) + randomInt(0, 99) / 100);
        const b = (randomInt(2, 20) + randomInt(0, 99) / 100);
        const answer = Math.round((a / b) * 100) / 100;
        return { id, difficulty, prompt: `${a.toFixed(2)} ÷ ${b.toFixed(2)} = ?`, answer, display: answer.toFixed(2) };
      }
    },
    check(body) {
      const { answer, display } = body;
      const userNum = parseFloat((body.userAnswer || '').trim());
      const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.01;
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

};

// ── Dispatcher ──────────────────────────────────────────────────────────────

router.get('/question', (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.question(req.query.difficulty || 'easy', req.query));
});

router.post('/check', require('express').json(), (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.check(req.body || {}));
});

module.exports = router;

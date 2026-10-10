/**
 * Equation Parser & Evaluator for Function Studio
 * Parses flexible linear equation inputs (y = ax + b and f(x) = ax + b)
 * and generates clean coordinate inquiry points for the isometric 2D grid.
 */

/**
 * Parses line equation input strictly starting with y = ...
 */
export function parseLineEquation(rawInput) {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    return {
      success: false,
      error: 'Please enter the equation of a line, for example: y = 2x + 3.'
    };
  }

  const trimmed = rawInput.trim();

  // If user inputs a function like f(x) = ...
  if (/^f\s*\(\s*x\s*\)/i.test(trimmed)) {
    return {
      success: false,
      error: 'That is a function definition f(x). Please enter the equation of a line starting with y = (e.g. y = 2x + 3).'
    };
  }

  // Must strictly start with y = or y= (case-insensitive)
  if (!/^y\s*=/i.test(trimmed)) {
    return {
      success: false,
      error: `An equation of a line must start with y = (for example: y = ${trimmed.startsWith('+') ? trimmed.slice(1) : trimmed || '2x + 3'}).`
    };
  }

  // Extract the right-hand side of y = ...
  let rhs = trimmed.replace(/^y\s*=\s*/i, '').trim().toLowerCase();

  if (!rhs) {
    return {
      success: false,
      error: 'Please complete the equation after y = (for example: y = 2x + 3).'
    };
  }

  return parseRhsToLineObject(rhs, false);
}

/**
 * Parses function equation input strictly starting with f(x) = ...
 */
export function parseFunctionEquation(rawInput) {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    return {
      success: false,
      error: 'Please enter a function using function notation, for example: f(x) = 2x + 3.'
    };
  }

  const trimmed = rawInput.trim();

  // If user inputs starting with y = ...
  if (/^y\s*=/i.test(trimmed)) {
    return {
      success: false,
      error: 'You entered a line equation starting with y =. Now use function notation starting with f(x) = (e.g. f(x) = 2x + 3).'
    };
  }

  // Must strictly start with f(x) = or f(x)= (case-insensitive)
  if (!/^f\s*\(\s*x\s*\)\s*=/i.test(trimmed)) {
    return {
      success: false,
      error: `A function definition must start with f(x) = (for example: f(x) = ${trimmed.startsWith('+') ? trimmed.slice(1) : trimmed || '2x + 3'}).`
    };
  }

  // Extract the right-hand side of f(x) = ...
  let rhs = trimmed.replace(/^f\s*\(\s*x\s*\)\s*=\s*/i, '').trim().toLowerCase();

  if (!rhs) {
    return {
      success: false,
      error: 'Please complete the function rule after f(x) = (for example: f(x) = 2x + 3).'
    };
  }

  return parseRhsToLineObject(rhs, true);
}

/**
 * Helper to parse the right-hand side (e.g. "2x + 3") into slope/intercept object
 */
function parseRhsToLineObject(rhs, isFunctionNotation = false) {
  const s = rhs.replace(/\s+/g, '');

  let m = null;
  let c = null;

  // Pattern 1: mx + c or mx - c or mx
  const stdMatch = s.match(/^([+-]?(?:\d+(?:\.\d+)?)?)\*?x(?:([+-]\d+(?:\.\d+)?))?$/);
  if (stdMatch) {
    const mStr = stdMatch[1];
    const cStr = stdMatch[2];

    if (mStr === '' || mStr === '+') m = 1;
    else if (mStr === '-') m = -1;
    else m = Number(mStr);

    c = cStr !== undefined ? Number(cStr) : 0;
  } else {
    // Pattern 2: Constant first: c + mx or c - mx
    const constFirstMatch = s.match(/^([+-]?\d+(?:\.\d+)?)([+-](?:\d+(?:\.\d+)?)?)\*?x$/);
    if (constFirstMatch) {
      c = Number(constFirstMatch[1]);
      const mStr = constFirstMatch[2];
      if (mStr === '+') m = 1;
      else if (mStr === '-') m = -1;
      else m = Number(mStr);
    } else {
      // Pattern 3: Horizontal line y = c or f(x) = c
      const horizMatch = s.match(/^([+-]?\d+(?:\.\d+)?)$/);
      if (horizMatch) {
        m = 0;
        c = Number(horizMatch[1]);
      }
    }
  }

  if (m === null || isNaN(m) || c === null || isNaN(c)) {
    return {
      success: false,
      error: `Format not recognized. Please enter a linear rule like ${isFunctionNotation ? 'f(x) = 2x + 3' : 'y = 2x + 3'}.`
    };
  }

  if (Math.abs(m) > 5) {
    return {
      success: false,
      error: `Slope (${m}) is too steep for this view. Please pick a slope between -5 and 5.`
    };
  }

  if (Math.abs(c) > 6) {
    return {
      success: false,
      error: `Intercept (${c}) is outside the grid. Please pick an intercept between -6 and 6.`
    };
  }

  let mPart = '';
  if (m === 1) mPart = 'x';
  else if (m === -1) mPart = '-x';
  else if (m === 0) mPart = '';
  else mPart = `${m}x`;

  let cPart = '';
  if (c > 0) {
    cPart = mPart ? ` + ${c}` : `${c}`;
  } else if (c < 0) {
    cPart = mPart ? ` - ${Math.abs(c)}` : `-${Math.abs(c)}`;
  } else if (c === 0) {
    cPart = mPart ? '' : '0';
  }

  const prefix = isFunctionNotation ? 'f(x) =' : 'y =';
  const equationDisplay = `${prefix} ${mPart}${cPart}`;
  const ggbCmd = m === 0 ? `${c}` : (c === 0 ? `${m}*x` : `${m}*x + (${c})`);
  const lineId = `user_line_${Math.abs(m)}_${m < 0 ? 'neg' : 'pos'}_${Math.abs(c)}_${c < 0 ? 'neg' : 'pos'}`;

  const candidateXs = [1, -2, 2, 0, -1, 3, -3, 4, -4];
  const inquiries = [];

  for (const testX of candidateXs) {
    const testY = m * testX + c;
    if (testY >= -6 && testY <= 8 && Number.isInteger(testY)) {
      inquiries.push({ x: testX, y: testY });
      if (inquiries.length === 3) break;
    }
  }

  if (inquiries.length < 3) {
    for (let testX = -5; testX <= 5; testX++) {
      if (!inquiries.some((inq) => inq.x === testX)) {
        const testY = m * testX + c;
        if (testY >= -7 && testY <= 9) {
          inquiries.push({ x: testX, y: testY });
          if (inquiries.length === 3) break;
        }
      }
    }
  }

  const eval2 = m * 2 + c;
  const eval4 = m * 4 + c;
  const inverseInquiries = getInverseInquiries({ m, c });

  return {
    success: true,
    id: lineId,
    m,
    c,
    equationDisplay,
    ggbCmd,
    inquiries,
    eval2,
    eval4,
    inverseInquiries,
    isFunctionNotation
  };
}

/**
 * Parses GeoGebra function evaluation calls like "f(2)" or "f(4)"
 * In GeoGebra, typing f(2) evaluates the function and returns its output value.
 */
export function parseFunctionEvaluationInput(inputStr, targetX, lineObjOrExpected) {
  if (!inputStr || typeof inputStr !== 'string' || !inputStr.trim()) {
    return {
      success: false,
      error: `Type f(${targetX}) to call your function with input ${targetX}.`
    };
  }

  const trimmed = inputStr.trim();

  // If user only entered a number without f(...)
  if (/^[+-]?\d+(?:\.\d+)?$/.test(trimmed)) {
    return {
      success: false,
      error: `In GeoGebra, call the function by typing f(${targetX}) rather than just the number.`
    };
  }

  // If they typed f(x)
  if (/^f\s*\(\s*x\s*\)$/i.test(trimmed)) {
    return {
      success: false,
      error: `Specify the input number inside the parentheses: type f(${targetX}).`
    };
  }

  // Match f(number) or f(number) = ...
  const match = trimmed.match(/^f\s*\(\s*(-?\d+)\s*\)(?:\s*=\s*(.*))?$/i);
  if (!match) {
    return {
      success: false,
      error: `Use GeoGebra command syntax: type f(${targetX}).`
    };
  }

  const enteredX = parseInt(match[1], 10);
  if (enteredX !== targetX) {
    return {
      success: false,
      error: `You called f(${enteredX}), but this question asks to evaluate at x = ${targetX}. Type f(${targetX}).`
    };
  }

  const expectedVal = (typeof lineObjOrExpected === 'object' && lineObjOrExpected !== null)
    ? (lineObjOrExpected.m * targetX + lineObjOrExpected.c)
    : Number(lineObjOrExpected);

  // If the user also typed = [value], verify if provided
  if (match[2] !== undefined && match[2].trim() !== '') {
    const val = parseFloat(match[2].trim());
    if (!isNaN(val) && val !== expectedVal) {
      return {
        success: false,
        error: `In GeoGebra you just type f(${targetX}), and GeoGebra computes ${expectedVal} for you!`
      };
    }
  }

  return {
    success: true,
    inputX: targetX,
    value: expectedVal,
    callDisplay: `f(${targetX})`,
    resultDisplay: `f(${targetX}) = ${expectedVal}`
  };
}

/**
 * Computes 3 inverse inquiries (given output y, find input a) for Question 9
 */
export function getInverseInquiries(lineObj) {
  if (!lineObj) {
    return [
      { a: 2, y: 5 },
      { a: -1, y: -1 },
      { a: 3, y: 7 }
    ];
  }
  const { m, c } = lineObj;
  if (m === 0) {
    return [
      { a: 2, y: c },
      { a: 0, y: c },
      { a: -2, y: c }
    ];
  }

  const candidateAs = [2, -1, 3, 0, 1, -2, 4, -3];
  const list = [];
  for (const testA of candidateAs) {
    const testY = m * testA + c;
    if (testY >= -6 && testY <= 8 && Number.isInteger(testY)) {
      list.push({ a: testA, y: testY });
      if (list.length === 3) break;
    }
  }

  if (list.length < 3) {
    for (let testA = -5; testA <= 5; testA++) {
      if (!list.some((item) => item.a === testA)) {
        const testY = m * testA + c;
        if (testY >= -7 && testY <= 9) {
          list.push({ a: testA, y: testY });
          if (list.length === 3) break;
        }
      }
    }
  }

  return list;
}

/**
 * Parses inverse function input (Question 9): e.g. "a = 2" or "2" when f(a) = 5
 */
export function parseInverseInput(inputStr, targetA, outputVal, lineObj) {
  if (!inputStr || typeof inputStr !== 'string' || !inputStr.trim()) {
    return {
      success: false,
      error: `Please enter the value of a (e.g. a = ? or enter number).`
    };
  }

  const trimmed = inputStr.trim();

  // Match "a = 2", "x = 2", or just "2"
  const match = trimmed.match(/^(?:[ax]\s*=\s*)?([+-]?\d+(?:\.\d+)?)$/i);
  if (!match) {
    return {
      success: false,
      error: `Please enter a valid number or equation for a (e.g. a = ? or enter number).`
    };
  }

  const val = parseFloat(match[1]);
  if (isNaN(val)) {
    return {
      success: false,
      error: `Please enter a valid numeric value for a.`
    };
  }

  if (val === outputVal && outputVal !== targetA) {
    return {
      success: false,
      error: `${outputVal} is the output f(a). We want to find what input a inside f(a) gives ${outputVal}.`
    };
  }

  if (val !== targetA) {
    let expr = 'your function rule';
    if (lineObj) {
      const mStr = lineObj.m === 1 ? '' : lineObj.m === -1 ? '-' : `${lineObj.m}`;
      const cStr = lineObj.c === 0 ? '' : lineObj.c > 0 ? ` + ${lineObj.c}` : ` - ${Math.abs(lineObj.c)}`;
      expr = `${mStr}a${cStr}`;
    }
    return {
      success: false,
      error: `Not quite. If ${expr} = ${outputVal}, what must a be?`
    };
  }

  return {
    success: true,
    value: val,
    display: `a = ${val}`
  };
}

/**
 * Evaluates an algebraic expression in variable b using Shunting-Yard
 */
export function evaluateBExpression(exprStr, bVal) {
  if (!exprStr || typeof exprStr !== 'string') return NaN;
  let str = exprStr.trim();
  // Strip optional leading assignment like "a =", "x =", "2a =", "ma =", etc.
  str = str.replace(/^(?:[a-z0-9]+\s*=\s*)/i, '').trim();

  // Must contain variable 'b' or 'B'
  if (!/b/i.test(str)) return NaN;

  // Insert explicit * for implicit multiplications: e.g. 2b -> 2*b, 0.5b -> 0.5*b, (b-1)2 -> (b-1)*2, 2(b-1) -> 2*(b-1)
  const norm = str
    .replace(/(\d)\s*b/gi, '$1*b')
    .replace(/b\s*(\d)/gi, 'b*$1')
    .replace(/(\d)\s*\(/g, '$1*(')
    .replace(/\)\s*(\d)/g, ')*$1')
    .replace(/\)\s*\(/g, ')*(')
    .replace(/\)\s*b/gi, ')*b')
    .replace(/b\s*\(/gi, 'b*(');

  const tokens = [];
  let i = 0;
  while (i < norm.length) {
    const ch = norm[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < norm.length && /[0-9.]/.test(norm[i])) {
        num += norm[i];
        i++;
      }
      tokens.push(parseFloat(num));
      continue;
    }
    if (ch === 'b' || ch === 'B') {
      tokens.push(bVal);
      i++;
      continue;
    }
    if (['+', '-', '*', '/', '(', ')'].includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }
    return NaN;
  }

  const proc = [];
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k];
    const prev = k > 0 ? proc[proc.length - 1] : null;
    if (t === '-' && (k === 0 || ['+', '-', '*', '/', '('].includes(prev))) {
      proc.push(0);
      proc.push('-');
    } else if (t === '+' && (k === 0 || ['+', '-', '*', '/', '('].includes(prev))) {
      // unary plus
    } else {
      proc.push(t);
    }
  }

  const out = [];
  const ops = [];
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  for (const t of proc) {
    if (typeof t === 'number') {
      out.push(t);
    } else if (t in prec) {
      while (ops.length && ops[ops.length - 1] in prec && prec[ops[ops.length - 1]] >= prec[t]) {
        out.push(ops.pop());
      }
      ops.push(t);
    } else if (t === '(') {
      ops.push(t);
    } else if (t === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        out.push(ops.pop());
      }
      if (!ops.length) return NaN;
      ops.pop();
    }
  }
  while (ops.length) {
    const op = ops.pop();
    if (op === '(' || op === ')') return NaN;
    out.push(op);
  }

  const stack = [];
  for (const t of out) {
    if (typeof t === 'number') {
      stack.push(t);
    } else {
      if (stack.length < 2) return NaN;
      const r = stack.pop();
      const l = stack.pop();
      if (t === '+') stack.push(l + r);
      else if (t === '-') stack.push(l - r);
      else if (t === '*') stack.push(l * r);
      else if (t === '/') {
        if (Math.abs(r) < 1e-12) return NaN;
        stack.push(l / r);
      }
    }
  }
  return stack.length === 1 ? stack[0] : NaN;
}

/**
 * Validates Step 1 of Question 11: isolating the m*a term (undoing c)
 * e.g. for 2a + 1 = b, expected term is b - 1
 */
export function parseStep1Term(inputStr, m, c) {
  if (!inputStr || typeof inputStr !== 'string' || !inputStr.trim()) {
    const example = c >= 0 ? `b - ${c}` : `b + ${Math.abs(c)}`;
    return {
      success: false,
      error: `Please enter the expression in terms of b (e.g. ${example}).`
    };
  }

  const trimmed = inputStr.trim();
  if (!/b/i.test(trimmed)) {
    return {
      success: false,
      error: `Remember to use the variable b (for example: ${c >= 0 ? `b - ${c}` : `b + ${Math.abs(c)}`}).`
    };
  }

  const val5 = evaluateBExpression(trimmed, 5);
  const val11 = evaluateBExpression(trimmed, 11);

  if (isNaN(val5) || isNaN(val11)) {
    return {
      success: false,
      error: 'Please enter a valid algebraic expression using b (e.g. b - 1).'
    };
  }

  const expected5 = 5 - c;
  const expected11 = 11 - c;

  if (Math.abs(val5 - expected5) < 1e-6 && Math.abs(val11 - expected11) < 1e-6) {
    return {
      success: true,
      display: c === 0 ? 'b' : c > 0 ? `b - ${c}` : `b + ${Math.abs(c)}`
    };
  }

  // Check common mistakes: forgot to flip sign
  const wrongSign5 = 5 + c;
  if (Math.abs(val5 - wrongSign5) < 1e-6) {
    return {
      success: false,
      error: `Check the sign: to undo ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}, you need to ${c >= 0 ? 'subtract' : 'add'} ${Math.abs(c)} from b.`
    };
  }

  return {
    success: false,
    error: `Not quite. If ${m === 1 ? 'a' : `${m}a`} ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} = b, what does ${m === 1 ? 'a' : `${m}a`} equal when you isolate it?`
  };
}

/**
 * Validates Step 2 of Question 11: isolating a completely (undoing m)
 * e.g. for 2a + 1 = b, expected formula for a is (b - 1) / 2
 */
export function parseStep2Inverse(inputStr, m, c) {
  if (!inputStr || typeof inputStr !== 'string' || !inputStr.trim()) {
    const cPart = c === 0 ? 'b' : c > 0 ? `(b - ${c})` : `(b + ${Math.abs(c)})`;
    const example = m === 1 ? cPart : `${cPart} / ${m}`;
    return {
      success: false,
      error: `Please enter the formula for a (e.g. a = ${example} or ${example}).`
    };
  }

  const trimmed = inputStr.trim();
  if (!/b/i.test(trimmed)) {
    return {
      success: false,
      error: 'Remember to express your answer in terms of the output variable b.'
    };
  }

  const val5 = evaluateBExpression(trimmed, 5);
  const val11 = evaluateBExpression(trimmed, 11);

  if (isNaN(val5) || isNaN(val11)) {
    return {
      success: false,
      error: 'Please enter a valid formula using b (for example: (b - 1)/2).'
    };
  }

  const expected5 = (5 - c) / m;
  const expected11 = (11 - c) / m;

  if (Math.abs(val5 - expected5) < 1e-6 && Math.abs(val11 - expected11) < 1e-6) {
    const cPart = c === 0 ? 'b' : c > 0 ? `(b - ${c})` : `(b + ${Math.abs(c)})`;
    const display = m === 1 ? cPart : `${cPart} / ${m}`;
    return {
      success: true,
      display
    };
  }

  // Check common mistake: missing parens e.g. b - 1/2
  const noParen5 = 5 - c / m;
  if (Math.abs(val5 - noParen5) < 1e-6 && m !== 1) {
    return {
      success: false,
      error: `Don't forget parentheses! The entire numerator must be divided by ${m}, like: (${c >= 0 ? `b - ${c}` : `b + ${Math.abs(c)}`})/${m}.`
    };
  }

  return {
    success: false,
    error: `Not quite. To isolate a from ${m === 1 ? '' : `${m}`}a = ${c >= 0 ? `b - ${c}` : `b + ${Math.abs(c)}`}, divide the entire right side by ${m}.`
  };
}


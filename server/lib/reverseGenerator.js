/**
 * Reverse Engineering Target Generator
 *
 * Generates mathematical targets and rules/constraints based on topic and difficulty level.
 */

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getQuestionRule(topic, qNum) {
  if (qNum === 1) return 'Q1: Standard construction (Warm-up)';

  switch (topic) {
    case 'addition':
      switch (qNum) {
        case 2: return 'Q2 Constraint: Neither term can be 0';
        case 3: return 'Q3 Constraint: Both terms must be > 1';
        case 4: return 'Q4 Constraint: Must use at least 1 negative number';
        case 5: return 'Q5 Constraint: Neither term can end in 0 (no multiples of 10)';
        case 6: return 'Q6 Constraint: Terms must have non-trivial difference (|a - b| > 5)';
        case 7: return 'Q7 Constraint: Must use a negative number and an odd/non-round term';
        case 8: return 'Q8 Constraint: Terms must be non-round (cannot end in 0 or 5)';
        case 9: return 'Q9 Constraint: At least one term must be an odd number';
        case 10: return '🔥 Q10 BOSS Constraint: Negative number with non-round terms addition!';
      }
      break;

    case 'multiplication':
      switch (qNum) {
        case 2: return 'Q2 Constraint: Neither factor can be 1';
        case 3: return 'Q3 Constraint: Both factors must be > 2';
        case 4: return 'Q4 Constraint: Both factors must be negative numbers';
        case 5: return 'Q5 Constraint: Neither factor can end in 0';
        case 6: return 'Q6 Constraint: Both factors must be > 3';
        case 7: return 'Q7 Constraint: Double negative non-round factors';
        case 8: return 'Q8 Constraint: Neither factor can end in 0 or 5';
        case 9: return 'Q9 Constraint: Factors must be distinct and > 4';
        case 10: return '🔥 Q10 BOSS Constraint: Double negative non-round factor multiplication!';
      }
      break;

    case 'division':
      switch (qNum) {
        case 2: return 'Q2 Constraint: Divisor must be > 1';
        case 3: return 'Q3 Constraint: Divisor must be > 2';
        case 4: return 'Q4 Constraint: Both dividend & divisor must be negative';
        case 5: return 'Q5 Constraint: Divisor cannot end in 0';
        case 6: return 'Q6 Constraint: Divisor must be > 5';
        case 7: return 'Q7 Constraint: Both dividend & divisor must be negative';
        case 8: return 'Q8 Constraint: Divisor must end in a non-round digit (e.g. 7, 12, 13)';
        case 9: return 'Q9 Constraint: Divisor must be > 10 and non-round';
        case 10: return '🔥 Q10 BOSS Constraint: Double negative with non-round divisor > 10!';
      }
      break;

    case 'fractions':
      switch (qNum) {
        case 2: return 'Q2 Constraint: Denominators must be > 1';
        case 3: return 'Q3 Constraint: Denominators must not be equal';
        case 4: return 'Q4 Constraint: Must use fraction subtraction (−)';
        case 5: return 'Q5 Constraint: Subtraction with unequal denominators';
        case 6: return 'Q6 Constraint: Must use an improper fraction (numerator > denominator)';
        case 7: return 'Q7 Constraint: Subtraction with improper fraction & unequal denominators';
        case 8: return 'Q8 Constraint: Denominators must be coprime (no common factors)';
        case 9: return 'Q9 Constraint: Must use at least 1 negative fraction numerator';
        case 10: return '🔥 Q10 BOSS Constraint: Fraction subtraction with improper fraction & coprime denominators!';
      }
      break;

    case 'linear-equations':
      switch (qNum) {
        case 2: return 'Q2 Constraint: Constant terms b1 and b2 must be non-zero';
        case 3: return 'Q3 Constraint: Coefficients a1 and a2 must be non-zero (x on both sides)';
        case 4: return 'Q4 Constraint: Must include at least 1 negative constant term';
        case 5: return 'Q5 Constraint: Coefficient difference |a1 - a2| must be > 1';
        case 6: return 'Q6 Constraint: x on both sides AND negative constant term';
        case 7: return 'Q7 Constraint: Both constant terms b1 and b2 must be negative';
        case 8: return 'Q8 Constraint: Constant terms must be non-round (not ending in 0)';
        case 9: return 'Q9 Constraint: |a1 - a2| > 2 with negative constant terms';
        case 10: return '🔥 Q10 BOSS Constraint: x on both sides, negative constants, AND non-round coefficients!';
      }
      break;

    case 'quadratic-equations':
      switch (qNum) {
        case 2: return 'Q2 Constraint: Constant term c must be non-zero';
        case 3: return 'Q3 Constraint: Linear coefficient b must be non-zero';
        case 4: return 'Q4 Constraint: Must have at least 1 negative root';
        case 5: return 'Q5 Constraint: Both roots must be negative numbers';
        case 6: return 'Q6 Constraint: Leading coefficient a must be > 1 (non-monic)';
        case 7: return 'Q7 Constraint: Non-monic leading a ≥ 2 with negative roots';
        case 8: return 'Q8 Constraint: Non-monic leading coefficient a ≥ 3';
        case 9: return 'Q9 Constraint: Non-monic leading a > 1 with non-zero b and c';
        case 10: return '🔥 Q10 BOSS Constraint: Non-monic leading a ≥ 2 with distinct negative roots!';
      }
      break;

    case 'geometry':
      switch (qNum) {
        case 2: return 'Q2 Constraint: Dimensions must be > 1 cm';
        case 3: return 'Q3 Constraint: Width and height must not be equal (not a square)';
        case 4: return 'Q4 Constraint: Dimensions must be > 2 cm';
        case 5: return 'Q5 Constraint: Side lengths must be non-round (not ending in 0)';
        case 6: return 'Q6 Constraint: Aspect ratio w/h must be a non-integer';
        case 7: return 'Q7 Constraint: Must use at least 1 decimal side length (e.g. 2.5 cm)';
        case 8: return 'Q8 Constraint: Both side lengths must be decimal dimensions';
        case 9: return 'Q9 Constraint: Decimal side lengths with non-round values';
        case 10: return '🔥 Q10 BOSS Constraint: Decimal side lengths with non-round values!';
      }
      break;

    case 'big-four':
      switch (qNum) {
        case 2: return 'Q2 Constraint: Neither term can be 0';
        case 3: return 'Q3 Constraint: Terms must be > 1';
        case 4: return 'Q4 Constraint: Must use 2 different operators';
        case 5: return 'Q5 Constraint: Must include at least one × or ÷ operator';
        case 6: return 'Q6 Constraint: Must include at least 1 negative term';
        case 7: return 'Q7 Constraint: Combine × or ÷ with a negative term';
        case 8: return 'Q8 Constraint: All terms must be non-round (not ending in 0 or 5)';
        case 9: return 'Q9 Constraint: 2 distinct operators with negative term and non-round values';
        case 10: return '🔥 Q10 BOSS Constraint: 2 distinct operators (including × or ÷), negative term, AND non-round values!';
      }
      break;
  }

  return 'Result must equal target';
}

/**
 * Generate a problem target for Reverse Engineering mode.
 * @param {string} topic
 * @param {number} difficulty
 * @param {number} questionNumber
 */
function generateTarget(topic = 'addition', difficulty = 0, questionNumber = 1) {
  const safeDiff = Math.max(0, Math.min(3, parseInt(difficulty, 10) || 0));
  const safeQ = Math.max(1, Math.min(10, parseInt(questionNumber, 10) || 1));
  const qRule = getQuestionRule(topic, safeQ);

  switch (topic) {
    case 'addition': {
      let target;
      if (safeDiff === 0) target = randomInt(10, 50);
      else if (safeDiff === 1) target = randomInt(50, 150);
      else if (safeDiff === 2) target = randomInt(150, 500);
      else target = randomInt(500, 2000);

      const rules = ['Result must equal target', qRule];

      return {
        id: `rev-add-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        topic: 'addition',
        difficulty: safeDiff,
        target,
        display: `Build an addition statement that equals ${target}`,
        rules,
        inputTemplate: {
          type: 'binary_operation',
          operator: '+',
          fields: ['a', 'b']
        }
      };
    }

    case 'multiplication': {
      let target;
      if (safeDiff === 0) target = pick([12, 16, 18, 20, 24, 30, 36, 40, 48, 60]);
      else if (safeDiff === 1) target = pick([72, 84, 90, 96, 100, 120, 144, 150, 180]);
      else if (safeDiff === 2) target = pick([210, 240, 360, 420, 480, 500, 720]);
      else target = pick([840, 960, 1000, 1200, 1440, 1800, 2400]);

      const rules = ['Result must equal target', qRule];

      return {
        id: `rev-mult-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        topic: 'multiplication',
        difficulty: safeDiff,
        target,
        display: `Build a multiplication statement that equals ${target}`,
        rules,
        inputTemplate: {
          type: 'binary_operation',
          operator: '×',
          fields: ['a', 'b']
        }
      };
    }

    case 'division': {
      let target;
      if (safeDiff === 0) target = pick([4, 5, 6, 8, 10, 12, 15]);
      else if (safeDiff === 1) target = pick([14, 16, 18, 20, 24, 25, 30]);
      else if (safeDiff === 2) target = pick([32, 36, 40, 45, 48, 50, 60]);
      else target = pick([64, 75, 80, 90, 100, 120, 150]);

      const rules = ['Result must equal target', qRule];

      return {
        id: `rev-div-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        topic: 'division',
        difficulty: safeDiff,
        target,
        display: `Build a division statement that equals ${target}`,
        rules,
        inputTemplate: {
          type: 'binary_operation',
          operator: '÷',
          fields: ['a', 'b']
        }
      };
    }

    case 'fractions': {
      const targets = [
        { display: '1/2', num: 1, den: 2, val: 0.5 },
        { display: '3/4', num: 3, den: 4, val: 0.75 },
        { display: '2/3', num: 2, den: 3, val: 2 / 3 },
        { display: '5/6', num: 5, den: 6, val: 5 / 6 },
        { display: '3/8', num: 3, den: 8, val: 0.375 },
        { display: '4/5', num: 4, den: 5, val: 0.8 }
      ];
      const targetObj = pick(targets);

      const rules = ['Operation must result in target fraction', qRule];

      return {
        id: `rev-frac-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        topic: 'fractions',
        difficulty: safeDiff,
        target: targetObj.display,
        targetValue: targetObj.val,
        display: `Build a fraction operation that equals ${targetObj.display}`,
        rules,
        inputTemplate: {
          type: 'fraction_operation',
          fields: ['n1', 'd1', 'op', 'n2', 'd2']
        }
      };
    }

    case 'linear-equations': {
      const xVal = randomInt(-10, 15);
      const rules = [`Equation must have solution x = ${xVal}`, qRule];

      return {
        id: `rev-lineq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        topic: 'linear-equations',
        difficulty: safeDiff,
        target: xVal,
        display: `Build a linear equation where x = ${xVal}`,
        rules,
        inputTemplate: {
          type: 'linear_eq_fields',
          fields: ['a1', 'b1', 'a2', 'b2'] // a1*x + b1 = a2*x + b2
        }
      };
    }

    case 'quadratic-equations': {
      let r1 = randomInt(-5, 6);
      let r2 = randomInt(-5, 6);
      if (r1 === r2) r2 += 1;

      const rules = [`Roots must be x = ${r1} and x = ${r2}`, qRule];

      return {
        id: `rev-quad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        topic: 'quadratic-equations',
        difficulty: safeDiff,
        target: { r1, r2 },
        display: `Build a quadratic equation with roots x = ${r1} and x = ${r2}`,
        rules,
        inputTemplate: {
          type: 'quadratic_fields',
          fields: ['a', 'b', 'c'] // ax^2 + bx + c = 0
        }
      };
    }

    case 'geometry': {
      let targetArea;
      if (safeDiff === 0) targetArea = pick([12, 16, 18, 20, 24]);
      else if (safeDiff === 1) targetArea = pick([30, 36, 40, 48, 50]);
      else if (safeDiff === 2) targetArea = pick([60, 64, 72, 80, 96]);
      else targetArea = pick([100, 120, 144, 150, 200]);

      const rules = [`Rectangle area must equal ${targetArea} cm²`, qRule];

      return {
        id: `rev-geo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        topic: 'geometry',
        difficulty: safeDiff,
        target: targetArea,
        display: `Build rectangle dimensions for area = ${targetArea} cm²`,
        rules,
        inputTemplate: {
          type: 'binary_operation',
          operator: '×',
          fields: ['w', 'h']
        }
      };
    }

    case 'big-four': {
      let target;
      if (safeDiff === 0) target = randomInt(10, 50);
      else if (safeDiff === 1) target = randomInt(50, 150);
      else if (safeDiff === 2) target = randomInt(150, 500);
      else target = randomInt(500, 2000);

      const rules = [`Result of (a op1 b) op2 c must equal ${target}`, qRule];

      return {
        id: `rev-bigfour-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        topic: 'big-four',
        difficulty: safeDiff,
        target,
        display: `Build a 2-operator expression (a op1 b) op2 c that equals ${target}`,
        rules,
        inputTemplate: {
          type: 'ternary_operation',
          fields: ['a', 'op1', 'b', 'op2', 'c']
        }
      };
    }

    default:
      return generateTarget('addition', safeDiff);
  }
}

module.exports = { generateTarget };

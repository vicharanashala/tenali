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

/**
 * Generate a problem target for Reverse Engineering mode.
 * @param {string} topic - e.g. 'addition', 'multiplication', 'fractions', 'linear-equations', 'quadratic-equations', 'geometry'
 * @param {number} difficulty - 0 (easy), 1 (medium), 2 (hard), 3 (extrahard)
 */
function generateTarget(topic = 'addition', difficulty = 0) {
  const safeDiff = Math.max(0, Math.min(3, parseInt(difficulty, 10) || 0));

  switch (topic) {
    case 'addition': {
      let target;
      if (safeDiff === 0) target = randomInt(10, 50);
      else if (safeDiff === 1) target = randomInt(50, 150);
      else if (safeDiff === 2) target = randomInt(150, 500);
      else target = randomInt(500, 2000);

      const rules = ['Result must equal target'];
      if (safeDiff >= 1) rules.push('Neither term can be 0');
      if (safeDiff >= 2) rules.push('Must use exactly 2 terms');
      if (safeDiff === 3) rules.push('Both terms must be positive integers > 10');

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

      const rules = ['Result must equal target'];
      if (safeDiff >= 1) rules.push('Both numbers must be > 1');
      if (safeDiff >= 2) rules.push('Neither number can be a multiple of 10');
      if (safeDiff === 3) rules.push('Both numbers must be greater than 5');

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

      const rules = ['Operation must result in target fraction'];
      if (safeDiff >= 1) rules.push('Use fraction addition or subtraction (+ or -)');
      if (safeDiff >= 2) rules.push('Denominators must not be equal');
      if (safeDiff === 3) rules.push('All numerators and denominators must be positive integers');

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
      const rules = [`Equation must have solution x = ${xVal}`];
      if (safeDiff >= 1) rules.push('x must appear on both sides of the equation');
      if (safeDiff >= 2) rules.push('Coefficients must be non-zero');
      if (safeDiff === 3) rules.push('Must involve a non-zero constant on both sides');

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

      const rules = [`Roots must be x = ${r1} and x = ${r2}`];
      if (safeDiff >= 1) rules.push('Must be in standard quadratic form ax² + bx + c = 0');
      if (safeDiff >= 2) rules.push('Leading coefficient a must be non-zero');
      if (safeDiff === 3) rules.push('a must be an integer > 1');

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
      let area;
      if (safeDiff === 0) area = pick([12, 16, 20, 24, 30, 36]);
      else if (safeDiff === 1) area = pick([40, 48, 54, 60, 72, 80]);
      else if (safeDiff === 2) area = pick([96, 100, 120, 144, 150, 180]);
      else area = pick([210, 240, 300, 360, 400]);

      const rules = [`Rectangle area must equal ${area} cm²`];
      if (safeDiff >= 1) rules.push('Both width and length must be integers > 1');
      if (safeDiff >= 2) rules.push('Width and length must not be equal (not a square)');
      if (safeDiff === 3) rules.push('Both sides must be greater than 3');

      return {
        id: `rev-geom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        topic: 'geometry',
        difficulty: safeDiff,
        target: area,
        display: `Build a rectangle with Area = ${area} cm²`,
        rules,
        inputTemplate: {
          type: 'binary_operation',
          operator: '×',
          fields: ['w', 'h']
        }
      };
    }

    default:
      return generateTarget('addition', safeDiff);
  }
}

module.exports = { generateTarget };

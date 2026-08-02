/**
 * Interactive Demo & Walkthrough Data for Reverse Engineering Topics
 */

export const REVERSE_DEMO_DATA = {
  addition: {
    topicId: 'addition',
    topicName: 'Addition Mode',
    icon: '➕',
    targetDisplay: 'Build an addition statement that equals 42',
    steps: [
      {
        stepTitle: 'Step 1: Understand the Target 🎯',
        description: 'You are given a target answer (42). Your job is to construct two numbers that sum up to 42.',
        preview: {
          display: '? + ? = 42'
        },
        tip: 'Any two numbers that add up to 42 are correct, but some are far more creative than others!'
      },
      {
        stepTitle: 'Step 2: Type Creative Inputs ⌨️',
        description: 'Instead of simple numbers like 40 + 2, try using a non-round negative number like -19.',
        preview: {
          inputs: { a: '-19', b: '61' },
          expression: '-19 + 61 = 42'
        },
        tip: 'Negative numbers add an extra layer of mathematical creativity!'
      },
      {
        stepTitle: 'Step 3: Check & Score 5 Stars! ⭐⭐⭐⭐⭐',
        description: 'Click Check Construction. The validator calculates: -19 + 61 = 42 ✓.',
        preview: {
          stars: 5,
          label: 'Exceptional (5 Stars)',
          feedback: '-19 + 61 = 42 ✓ — Outstanding use of negative non-round numbers!'
        },
        tip: '🌟 Pro-Tip: Non-round negative numbers always unlock maximum 5-Star rating!'
      }
    ]
  },

  multiplication: {
    topicId: 'multiplication',
    topicName: 'Multiplication Mode',
    icon: '✖️',
    targetDisplay: 'Build a multiplication statement that equals 72',
    steps: [
      {
        stepTitle: 'Step 1: Understand the Target 🎯',
        description: 'Construct a factor pair (a × b) that multiplies together to equal 72.',
        preview: {
          display: '? × ? = 72'
        },
        tip: 'Multiplying by 1 (1 × 72) is trivial, so try finding creative factor pairs!'
      },
      {
        stepTitle: 'Step 2: Use Double Negative Factors ⌨️',
        description: 'Did you know that two negative numbers multiplied together produce a positive result?',
        preview: {
          inputs: { a: '-8', b: '-9' },
          expression: '-8 × -9 = 72'
        },
        tip: '(-8) × (-9) = +72 because negative times negative equals positive!'
      },
      {
        stepTitle: 'Step 3: Score 5 Stars! ⭐⭐⭐⭐⭐',
        description: 'The system validates your double-negative factor pair.',
        preview: {
          stars: 5,
          label: 'Exceptional (5 Stars)',
          feedback: '-8 × -9 = 72 ✓ — Brilliant double negative factor multiplication!'
        },
        tip: '🌟 Pro-Tip: Double negative factors always earn 5 Stars!'
      }
    ]
  },

  division: {
    topicId: 'division',
    topicName: 'Division Mode',
    icon: '➗',
    targetDisplay: 'Build a division statement that equals 12',
    steps: [
      {
        stepTitle: 'Step 1: Understand the Target 🎯',
        description: 'Construct a division statement (a ÷ b) that evaluates to quotient 12.',
        preview: {
          display: '? ÷ ? = 12'
        },
        tip: 'Dividing by 1 (12 ÷ 1) is trivial. Let’s try something far more creative!'
      },
      {
        stepTitle: 'Step 2: Use Double Negative Division ⌨️',
        description: 'Dividing two negative numbers also yields a positive result!',
        preview: {
          inputs: { a: '-144', b: '-12' },
          expression: '-144 ÷ -12 = 12'
        },
        tip: '(-144) ÷ (-12) = +12 because negative divided by negative equals positive!'
      },
      {
        stepTitle: 'Step 3: Score 5 Stars! ⭐⭐⭐⭐⭐',
        description: 'The system validates your double negative division.',
        preview: {
          stars: 5,
          label: 'Exceptional (5 Stars)',
          feedback: '-144 ÷ -12 = 12 ✓ — Outstanding double negative division!'
        },
        tip: '🌟 Pro-Tip: Double negative division or non-round divisors earn 5 Stars!'
      }
    ]
  },

  fractions: {
    topicId: 'fractions',
    topicName: 'Fractions Mode',
    icon: '🍕',
    targetDisplay: 'Build a fraction operation that equals 3/4',
    steps: [
      {
        stepTitle: 'Step 1: Understand the Target 🎯',
        description: 'Construct a fraction addition or subtraction statement that equals 3/4 (0.75).',
        preview: {
          display: '(num1 / den1) [op] (num2 / den2) = 3/4'
        },
        tip: 'Same denominator addition (1/4 + 2/4) is simple. Let’s build something masterclass!'
      },
      {
        stepTitle: 'Step 2: Use Fraction Subtraction & Unequal Denominators ⌨️',
        description: 'Choose fraction subtraction with unequal denominators like 7/6 - 5/12.',
        preview: {
          inputs: { n1: '7', d1: '6', op: '-', n2: '5', d2: '12' },
          expression: '7/6 - 5/12 = 14/12 - 5/12 = 9/12 = 3/4'
        },
        tip: 'Unequal denominators force common denominator finding!'
      },
      {
        stepTitle: 'Step 3: Score 5 Stars! ⭐⭐⭐⭐⭐',
        description: 'The system evaluates: 1.167 - 0.417 = 0.75 ✓.',
        preview: {
          stars: 5,
          label: 'Exceptional (5 Stars)',
          feedback: '7/6 - 5/12 = 3/4 ✓ — Masterful fraction subtraction with distinct denominators!'
        },
        tip: '🌟 Pro-Tip: Fraction subtraction with unequal denominators earns 5 Stars!'
      }
    ]
  },

  'linear-equations': {
    topicId: 'linear-equations',
    topicName: 'Linear Equations Mode',
    icon: '📈',
    targetDisplay: 'Build a linear equation where x = 5',
    steps: [
      {
        stepTitle: 'Step 1: Understand the Target 🎯',
        description: 'Build a two-sided linear equation: a1·x + b1 = a2·x + b2 whose solution is x = 5.',
        preview: {
          display: 'a1·x + b1 = a2·x + b2 (solution x = 5)'
        },
        tip: 'Think of a balance scale where both sides calculate to the same value when x = 5!'
      },
      {
        stepTitle: 'Step 2: Construct Both Sides ⌨️',
        description: 'Pick x terms on both sides and a negative constant. For x = 5:\nLeft: 3(5) - 7 = 8.\nRight: 1(5) + 3 = 8.',
        preview: {
          inputs: { a1: '3', b1: '-7', a2: '1', b2: '3' },
          expression: '3x - 7 = x + 3'
        },
        tip: 'Plugging x = 5 gives 15 - 7 = 8 on Left and 5 + 3 = 8 on Right!'
      },
      {
        stepTitle: 'Step 3: Score 5 Stars! ⭐⭐⭐⭐⭐',
        description: 'The system verifies 3(5) - 7 = 5 + 3 = 8 ✓.',
        preview: {
          stars: 5,
          label: 'Exceptional (5 Stars)',
          feedback: '3x - 7 = x + 3 ✓ — Exceptional two-sided equation with negative constant!'
        },
        tip: '🌟 Pro-Tip: Putting x on both sides with a negative constant earns 5 Stars!'
      }
    ]
  },

  'quadratic-equations': {
    topicId: 'quadratic-equations',
    topicName: 'Quadratic Equations Mode',
    icon: '📐',
    targetDisplay: 'Build a quadratic equation with roots x = 3 and x = -2',
    steps: [
      {
        stepTitle: 'Step 1: Understand the Target 🎯',
        description: 'Construct a quadratic equation a·x² + b·x + c = 0 that has roots x = 3 and x = -2.',
        preview: {
          display: 'a·x² + b·x + c = 0 (roots x = 3, -2)'
        },
        tip: 'Standard monic equation is (x - 3)(x + 2) = x² - x - 6 = 0.'
      },
      {
        stepTitle: 'Step 2: Use Non-Monic Coefficient a > 1 ⌨️',
        description: 'Multiply the entire quadratic by a leading factor like a = 2:\n2(x² - x - 6) = 2x² - 2x - 12 = 0.',
        preview: {
          inputs: { a: '2', b: '-2', c: '-12' },
          expression: '2x² - 2x - 12 = 0'
        },
        tip: 'Non-monic quadratics (a > 1) show advanced algebraic mastery!'
      },
      {
        stepTitle: 'Step 3: Score 5 Stars! ⭐⭐⭐⭐⭐',
        description: 'The system verifies roots via Vieta’s formulas: -b/a = 1 and c/a = -6 ✓.',
        preview: {
          stars: 5,
          label: 'Exceptional (5 Stars)',
          feedback: '2x² - 2x - 12 = 0 ✓ — Brilliant use of non-monic leading coefficient!'
        },
        tip: '🌟 Pro-Tip: Setting leading coefficient a > 1 earns 5 Stars!'
      }
    ]
  },

  geometry: {
    topicId: 'geometry',
    topicName: 'Geometry Area Mode',
    icon: '⏹️',
    targetDisplay: 'Build a rectangle with Area = 24 cm²',
    steps: [
      {
        stepTitle: 'Step 1: Understand the Target 🎯',
        description: 'Find Width (w) and Height (h) such that Width × Height = 24 cm².',
        preview: {
          display: 'Width × Height = 24 cm²'
        },
        tip: 'Simple whole numbers like 4 × 6 = 24 are standard. Let’s try decimal dimensions!'
      },
      {
        stepTitle: 'Step 2: Use Decimal Side Dimensions ⌨️',
        description: 'Pick a decimal width like 2.5 cm. Calculate height: 24 / 2.5 = 9.6 cm.',
        preview: {
          inputs: { w: '2.5', h: '9.6' },
          expression: '2.5 cm × 9.6 cm = 24 cm²'
        },
        tip: '2.5 × 9.6 = 24.0 cm² exactly!'
      },
      {
        stepTitle: 'Step 3: Score 5 Stars! ⭐⭐⭐⭐⭐',
        description: 'The system validates 2.5 × 9.6 = 24 cm² ✓.',
        preview: {
          stars: 5,
          label: 'Exceptional (5 Stars)',
          feedback: 'Rectangle 2.5 cm × 9.6 cm = 24 cm² ✓ — Outstanding use of decimal side dimensions!'
        },
        tip: '🌟 Pro-Tip: Fractional or decimal side dimensions earn 5 Stars!'
      }
    ]
  },

  'big-four': {
    topicId: 'big-four',
    topicName: 'The Big 4 Mode',
    icon: '⚡',
    targetDisplay: 'Build a 2-operator expression (a op1 b) op2 c that equals 72',
    steps: [
      {
        stepTitle: 'Step 1: Understand the Target 🎯',
        description: 'Combine two different arithmetic operations (+, −, ×, ÷) across 3 terms (a, b, c) to hit target 72.',
        preview: {
          display: '(a op1 b) op2 c = 72'
        },
        tip: 'Mixing different operators tests true multi-step mental agility!'
      },
      {
        stepTitle: 'Step 2: Combine Negatives & Multiplication ⌨️',
        description: 'Try combining addition with multiplication, starting with a negative term: (-5 + 23) × 4 = 18 × 4 = 72.',
        preview: {
          inputs: { a: '-5', op1: '+', b: '23', op2: '*', c: '4' },
          expression: '(-5 + 23) × 4 = 72'
        },
        tip: 'Combining negative terms with multiplication unlocks maximum creativity rating!'
      },
      {
        stepTitle: 'Step 3: Score 5 Stars! ⭐⭐⭐⭐⭐',
        description: 'Click Check Construction. The validator checks: (-5 + 23) × 4 = 18 × 4 = 72 ✓.',
        preview: {
          stars: 5,
          label: 'Exceptional (5 Stars)',
          feedback: '(-5 + 23) × 4 = 72 ✓ — Outstanding combination of negative numbers with multiplication/division!'
        },
        tip: '🌟 Pro-Tip: Combining negative terms with distinct operators (like + and ×) earns 5 Stars!'
      }
    ]
  }
};

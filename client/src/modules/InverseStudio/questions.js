export const PHASES = [
  { id: '1d-inverse', label: '1D Inverse', subtitle: 'Undoing scalar functions' },
  { id: 'discovery', label: 'Discovery', subtitle: 'Key takeaways' }
];

export const INVERSE_QUESTIONS = [
  {
    id: 1,
    phaseId: '1d-inverse',
    key: 'q1_input',
    title: 'Linear Function',
    heading: 'Enter a random linear function',
    subtext: 'Type a linear rule of the form f(x) = ax + b (for example, 2x + 3).'
  },
  {
    id: 2,
    phaseId: '1d-inverse',
    key: 'a',
    title: 'Backward Thinking',
    heading: 'Find α when f(α) is given',
    subtext: 'Find input α when given values of f(α).'
  },
  {
    id: 3,
    phaseId: '1d-inverse',
    key: 'b1',
    title: 'Reverse Function?',
    heading: 'Can a function take the output of f(x) and return input x?',
    subtext: 'Can a single rule reverse the mapping and recover original inputs?'
  },
  {
    id: 4,
    phaseId: '1d-inverse',
    key: 'b2_ops',
    title: 'How to Undo',
    heading: 'How do we undo f(x)?',
    subtext: 'Reverse operations in opposite order.'
  },
  {
    id: 5,
    phaseId: '1d-inverse',
    key: 'b2_test',
    title: 'Test Reverse Rule',
    heading: 'Test with x = 10',
    subtext: 'Find f(10) then reverse it with g.'
  },
  {
    id: 6,
    phaseId: '1d-inverse',
    key: 'b3_swap',
    title: 'Swap Pattern',
    heading: 'The Inverse Swaps Inputs & Outputs',
    subtext: 'The input of f became the output of g, and output of f became the input of g.'
  },
  {
    id: 7,
    phaseId: '1d-inverse',
    key: 'c',
    title: 'Use the Inverse',
    heading: 'Find α using f⁻¹(y)',
    subtext: 'Put output into f⁻¹ to recover α in one step.'
  },
  {
    id: 8,
    phaseId: '1d-inverse',
    key: 'd',
    title: 'Craft Inverse',
    heading: 'Build inverse for f(x) = 7x + 2',
    subtext: 'Find function f⁻¹(x) that reverses 7x + 2.'
  },
  {
    id: 'summary',
    phaseId: 'discovery',
    key: 'summary',
    title: 'Summary',
    heading: 'The Inverse Function',
    subtext: 'Core principles of inverting a function.'
  }
];

/**
 * Quiz engine for Periodic Table Lab.
 *
 * Generates random questions from the 118-element dataset across
 * five question types so students can practise recall of:
 *   - element symbols, names, atomic numbers
 *   - electron shell configurations
 *   - element categories / families
 *   - subatomic particle counts
 */

import elementsData from './elements118.json';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type QuizType =
  | 'symbol-to-name'
  | 'name-to-symbol'
  | 'number-to-element'
  | 'category-identify'
  | 'subatomic-count';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  prompt: string;
  options: string[];
  correctIndex: number;
  /** Extra context shown after answering (e.g. explanation) */
  explanation: string;
  /** Atomic number of the element the question is about */
  elementNumber: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

function categoryLabel(cat: string): string {
  return cat
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ------------------------------------------------------------------ */
/*  Question generators                                                */
/* ------------------------------------------------------------------ */

function genSymbolToName(): QuizQuestion {
  const el = elementsData[Math.floor(Math.random() * elementsData.length)];
  const distractors = pickRandom(
    elementsData.filter((e) => e.number !== el.number),
    3
  ).map((e) => e.name);
  const options = shuffle([el.name, ...distractors]);
  return {
    id: `s2n-${el.number}-${Date.now()}`,
    type: 'symbol-to-name',
    prompt: `What is the name of the element with symbol "${el.symbol}"?`,
    options,
    correctIndex: options.indexOf(el.name),
    explanation: `${el.symbol} is the symbol for ${el.name} (Z = ${el.number}).`,
    elementNumber: el.number,
  };
}

function genNameToSymbol(): QuizQuestion {
  const el = elementsData[Math.floor(Math.random() * elementsData.length)];
  const distractors = pickRandom(
    elementsData.filter((e) => e.number !== el.number),
    3
  ).map((e) => e.symbol);
  const options = shuffle([el.symbol, ...distractors]);
  return {
    id: `n2s-${el.number}-${Date.now()}`,
    type: 'name-to-symbol',
    prompt: `What is the chemical symbol for ${el.name}?`,
    options,
    correctIndex: options.indexOf(el.symbol),
    explanation: `${el.name} has the symbol ${el.symbol} and atomic number ${el.number}.`,
    elementNumber: el.number,
  };
}

function genNumberToElement(): QuizQuestion {
  const el = elementsData[Math.floor(Math.random() * elementsData.length)];
  const distractors = pickRandom(
    elementsData.filter((e) => e.number !== el.number),
    3
  ).map((e) => `${e.name} (${e.symbol})`);
  const correct = `${el.name} (${el.symbol})`;
  const options = shuffle([correct, ...distractors]);
  return {
    id: `n2e-${el.number}-${Date.now()}`,
    type: 'number-to-element',
    prompt: `Which element has atomic number ${el.number}?`,
    options,
    correctIndex: options.indexOf(correct),
    explanation: `Atomic number ${el.number} is ${el.name} (${el.symbol}), in Period ${el.period}.`,
    elementNumber: el.number,
  };
}

function genCategoryIdentify(): QuizQuestion {
  const el = elementsData[Math.floor(Math.random() * elementsData.length)];
  const correctCat = categoryLabel(el.category);
  const allCats = [...new Set(elementsData.map((e) => categoryLabel(e.category)))];
  const distractors = pickRandom(
    allCats.filter((c) => c !== correctCat),
    3
  );
  const options = shuffle([correctCat, ...distractors]);
  return {
    id: `cat-${el.number}-${Date.now()}`,
    type: 'category-identify',
    prompt: `Which chemical family does ${el.name} (${el.symbol}) belong to?`,
    options,
    correctIndex: options.indexOf(correctCat),
    explanation: `${el.name} is classified as a ${correctCat}. It's in Period ${el.period}${el.group ? `, Group ${el.group}` : ' (f-block)'}.`,
    elementNumber: el.number,
  };
}

function genSubatomicCount(): QuizQuestion {
  const el = elementsData[Math.floor(Math.random() * elementsData.length)];
  const protons = el.number;
  const neutrons = el.massNumber - el.number;
  const electrons = el.number;

  // Randomly pick which particle to ask about
  const particle = pickRandom(['protons', 'neutrons', 'electrons'] as const, 1)[0];
  const correctCount =
    particle === 'protons' ? protons : particle === 'neutrons' ? neutrons : electrons;

  // Generate plausible wrong answers near the correct value
  const wrongSet = new Set<number>();
  while (wrongSet.size < 3) {
    const offset = Math.floor(Math.random() * 6) + 1;
    const candidate = correctCount + (Math.random() > 0.5 ? offset : -offset);
    if (candidate >= 0 && candidate !== correctCount) {
      wrongSet.add(candidate);
    }
  }
  const options = shuffle([
    String(correctCount),
    ...[...wrongSet].map(String),
  ]);

  const formulaHint =
    particle === 'protons'
      ? 'Z (atomic number)'
      : particle === 'neutrons'
      ? `A − Z = ${el.massNumber} − ${el.number}`
      : 'Same as Z for a neutral atom';

  return {
    id: `sub-${el.number}-${particle}-${Date.now()}`,
    type: 'subatomic-count',
    prompt: `How many ${particle} does a neutral ${el.name} (${el.symbol}) atom have? (A = ${el.massNumber})`,
    options,
    correctIndex: options.indexOf(String(correctCount)),
    explanation: `${el.name} has ${protons} protons, ${neutrons} neutrons, and ${electrons} electrons. Formula: ${formulaHint}.`,
    elementNumber: el.number,
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

const GENERATORS: Record<QuizType, () => QuizQuestion> = {
  'symbol-to-name': genSymbolToName,
  'name-to-symbol': genNameToSymbol,
  'number-to-element': genNumberToElement,
  'category-identify': genCategoryIdentify,
  'subatomic-count': genSubatomicCount,
};

export const QUIZ_TYPE_LABELS: Record<QuizType, string> = {
  'symbol-to-name': 'Symbol → Name',
  'name-to-symbol': 'Name → Symbol',
  'number-to-element': 'Atomic Number → Element',
  'category-identify': 'Identify Category',
  'subatomic-count': 'Subatomic Particle Count',
};

/** Generate a quiz of `count` questions, optionally limited to specific types. */
export function generateQuiz(
  count: number = 10,
  types?: QuizType[]
): QuizQuestion[] {
  const chosenTypes = types && types.length > 0 ? types : (Object.keys(GENERATORS) as QuizType[]);
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const type = chosenTypes[Math.floor(Math.random() * chosenTypes.length)];
    questions.push(GENERATORS[type]());
  }
  return questions;
}

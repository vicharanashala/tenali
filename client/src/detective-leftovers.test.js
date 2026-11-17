/**
 * Follow-up tests for the Detective Agency (#519).
 *
 * Covers what the first test suite did not: answers that must be accepted in
 * more than one written form, the board engine rules that a mutation run
 * showed were untested, the empty "reasons" case, and a check of the displayed
 * mathematics for every dynamic case that had no such check.
 */

import { describe, test, expect, vi, afterAll } from 'vitest';
import { checkDetectiveAnswer } from './detective-answer';
import { CASE_GENERATORS } from './detective-generators';
import { BOARD_CASES } from './detective-board-cases';
import { getEliminationReasons } from './detective-stories';
import {
  createInitialState,
  registerAnswer,
  currentVariantKey,
  getMathFor,
  onlyCulpritRemains,
} from './detective-board-engine';

// ─── Answer checker ──────────────────────────────────────────────────

describe('checkDetectiveAnswer - expressions', () => {
  test('a coefficient of 1 may be left out', () => {
    expect(checkDetectiveAnswer('1x^3 + 5x + C', 'x^3 + 5x + C')).toBe(true);
    expect(checkDetectiveAnswer('1x^3 + 5x + C', 'x^3+5x+C')).toBe(true);
    expect(checkDetectiveAnswer('x^3 + 5x + C', '1x^3 + 5x + C')).toBe(true);
    expect(checkDetectiveAnswer('x^3 + 5x + C', 'x³ + 5x + C')).toBe(true);
  });

  test('a fractional coefficient may be written as a fraction or a decimal', () => {
    expect(checkDetectiveAnswer('(5/3)x^3 + 7x + C', '(5/3)x^3 + 7x + C')).toBe(true);
    expect(checkDetectiveAnswer('(5/3)x^3 + 7x + C', '5/3 x^3 + 7x + C')).toBe(true);
    expect(checkDetectiveAnswer('(5/3)x^3 + 7x + C', '1.67x^3 + 7x + C')).toBe(true);
    expect(checkDetectiveAnswer('(5/3)x^3 + 7x + C', '1.5x^3 + 7x + C')).toBe(false);
    expect(checkDetectiveAnswer('(5/3)x^3 + 7x + C', '2x^3 + 7x + C')).toBe(false);
  });

  test('order of terms does not matter, but every term and the constant C do', () => {
    expect(checkDetectiveAnswer('x^3 + 5x + C', '5x + x^3 + C')).toBe(true);
    expect(checkDetectiveAnswer('x^3 + 5x + C', 'x^3 + 5x')).toBe(false);
    expect(checkDetectiveAnswer('x^3 + 5x + C', 'x^3 + C')).toBe(false);
    expect(checkDetectiveAnswer('x^3 + 5x + C', 'x^3 + 6x + C')).toBe(false);
    expect(checkDetectiveAnswer('x^3 + 5x + C', 'x^2 + 5x + C')).toBe(false);
  });

  test('a single derivative term is still compared exactly', () => {
    expect(checkDetectiveAnswer('12x^2', '12x^2')).toBe(true);
    expect(checkDetectiveAnswer('12x^2', '12 x^2')).toBe(true);
    expect(checkDetectiveAnswer('12x^2', '6x^2')).toBe(false);
    expect(checkDetectiveAnswer('12x^2', 'x^2')).toBe(false);
  });

  test('words that merely contain the letter x are not read as expressions', () => {
    expect(checkDetectiveAnswer('exit', 'Exit')).toBe(true);
    expect(checkDetectiveAnswer('exit', 'entry')).toBe(false);
  });
});

describe('checkDetectiveAnswer - rounded answers and clock readings', () => {
  test('a caller can widen the tolerance for an answer the question asks to round', () => {
    expect(checkDetectiveAnswer(23, '23.09')).toBe(false);
    expect(checkDetectiveAnswer(23, '23.09', { tolerance: 0.5 })).toBe(true);
    expect(checkDetectiveAnswer(23, '23', { tolerance: 0.5 })).toBe(true);
    expect(checkDetectiveAnswer(23, '23.4', { tolerance: 0.5 })).toBe(true);
    expect(checkDetectiveAnswer(23, '23.6', { tolerance: 0.5 })).toBe(false);
    expect(checkDetectiveAnswer(23, '24', { tolerance: 0.5 })).toBe(false);
  });

  test('a tolerance that is missing or invalid falls back to the house tolerance', () => {
    expect(checkDetectiveAnswer(15, '15.004', { tolerance: undefined })).toBe(true);
    expect(checkDetectiveAnswer(15, '15.4', { tolerance: 0 })).toBe(false);
    expect(checkDetectiveAnswer(15, '15.4', { tolerance: -1 })).toBe(false);
  });

  test('an hour answer accepts the way a child writes a clock reading', () => {
    for (const reading of ['2', '2:00', '2 : 00', '2.00', "2 o'clock", '2 oclock', '02:00']) {
      expect(checkDetectiveAnswer(2, reading), reading).toBe(true);
    }
    for (const reading of ['3:00', '2:30', '12:00', "3 o'clock", '2:0']) {
      expect(checkDetectiveAnswer(2, reading), reading).toBe(false);
    }
  });

  test('clock readings are not accepted for answers that are not an hour', () => {
    expect(checkDetectiveAnswer(40, '40:00')).toBe(false);
    expect(checkDetectiveAnswer(15, "15 o'clock")).toBe(false);
  });
});

// ─── Board engine rules the first suite did not pin down ─────────────

describe('board engine - rules that a mutation run found untested', () => {
  const spec = BOARD_CASES[0];
  const footprints = spec.objects.find(o => o.id === 'footprints');

  test('a wrong answer collects no evidence and counts no correct answer', () => {
    const state = createInitialState(spec);
    const result = registerAnswer(state, spec, footprints, '999');
    expect(result.correct).toBe(false);
    expect(result.event.type).toBe('wrong');
    expect(result.state.collectedEvidenceIds).toEqual([]);
    expect(result.state.correctCount).toBe(0);
  });

  test('two hints on one clue drop it back to the easy question at any band', () => {
    for (const band of [0, 1, 2]) {
      const state = { ...createInitialState(spec), band, hintsUsedPerObject: { footprints: 2 } };
      expect(currentVariantKey(state, footprints), `band ${band}`).toBe('easy');
      expect(getMathFor(state, footprints)).toBe(footprints.investigation.math.easy);
    }
    const hard = { ...createInitialState(spec), band: 2, hintsUsedPerObject: { footprints: 1 } };
    expect(currentVariantKey(hard, footprints)).toBe('hard');
  });

  test('the case is only cracked when the one suspect left is the culprit', () => {
    const everyoneBut = keep => ({
      ...createInitialState(spec),
      eliminatedIds: spec.suspects.map(s => s.id).filter(id => id !== keep),
    });
    expect(onlyCulpritRemains(spec, everyoneBut(spec.culprit))).toBe(true);
    const wrongOne = spec.suspects.find(s => s.id !== spec.culprit).id;
    expect(onlyCulpritRemains(spec, everyoneBut(wrongOne))).toBe(false);
  });

  test('board case 1: the culprit\'s paw is the size of the print that the footprint clue measures', () => {
    const culprit = spec.suspects.find(suspect => suspect.id === spec.culprit);
    const measured = ['easy', 'medium', 'hard'].map(level => footprints.investigation.math[level].answer);
    expect(new Set(measured).size).toBe(1);
    expect(culprit.profile.footprint).toBe(`${measured[0]} cm`);
    // The comparison prompt that lists every paw must agree with the profile.
    const lists = [];
    const walk = node => {
      if (Array.isArray(node)) {
        if (node.length && node.every(item => item && item.suspectId && item.value)) lists.push(node);
        node.forEach(walk);
      } else if (node && typeof node === 'object') Object.values(node).forEach(walk);
    };
    walk(spec);
    const pawList = lists.find(list => list.some(item => /cm$/.test(item.value)));
    expect(pawList).toBeTruthy();
    expect(pawList.find(item => item.suspectId === culprit.id).value).toBe(culprit.profile.footprint);
  });

  test('a clue that asks for rounding accepts the unrounded value through the engine', () => {
    const rounded = {
      ...footprints,
      investigation: {
        ...footprints.investigation,
        math: { easy: { narrative: 'n', question: 'q', answer: 23, answerTolerance: 0.5 } },
      },
    };
    const state = createInitialState(spec);
    expect(registerAnswer(state, spec, rounded, '23.09').correct).toBe(true);
    expect(registerAnswer(state, spec, rounded, '23.6').correct).toBe(false);
  });
});

describe('getEliminationReasons', () => {
  const suspects = [
    { id: 'a', name: 'Ann', role: 'Cashier', characteristics: {} },
    { id: 'b', name: 'Bob', role: 'Guard', characteristics: {} },
  ];

  test('offers no reasons for a suspect the evidence does not rule out', () => {
    const evidence = { text: 'The till was opened.', eliminates: ['b'] };
    expect(getEliminationReasons(evidence, suspects[0], suspects)).toEqual([]);
  });

  test('offers exactly one correct reason for a suspect the evidence rules out', () => {
    const evidence = { text: 'The till was opened.', eliminates: ['b'] };
    const reasons = getEliminationReasons(evidence, suspects[1], suspects);
    expect(reasons.filter(r => r.correct)).toHaveLength(1);
    expect(reasons.length).toBeGreaterThan(1);
  });
});

// ─── Displayed mathematics of the dynamic cases ──────────────────────

function mulberry32(seed) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS = 60;

describe('dynamic cases - the stored answer matches the displayed question', () => {
  const randomSpy = vi.spyOn(Math, 'random');
  afterAll(() => randomSpy.mockRestore());

  function eachStory(id, check) {
    for (let seed = 1; seed <= SEEDS; seed++) {
      randomSpy.mockImplementation(mulberry32(seed * 2654435761));
      const story = CASE_GENERATORS[id]();
      check(story, `${id} @ seed ${seed}`);
    }
  }

  function match(question, pattern, context) {
    const found = question.match(pattern);
    expect(found, `${context}: ${question}`).not.toBeNull();
    return found;
  }

  test('every generator: no floating point noise, NaN or undefined in the text', () => {
    for (const id of Object.keys(CASE_GENERATORS)) {
      eachStory(id, (story, context) => {
        const text = JSON.stringify(story);
        expect(text, `${context} has a long decimal`).not.toMatch(/\d\.\d{6,}/);
        expect(text, `${context} has NaN`).not.toMatch(/NaN|undefined|Infinity/);
        expect(text, `${context} has a wrong ordinal`).not.toMatch(/\b[123]th\b/);
        expect(text, `${context} has an unfinished product`).not.toMatch(/\.\.\. × \d+( \(\d+ terms\)|\))/);
      });
    }
  });

  test('every generator: the typed stored answer is always accepted', () => {
    for (const id of Object.keys(CASE_GENERATORS)) {
      eachStory(id, (story, context) => {
        story.stages.forEach((stage, i) => {
          expect(
            checkDetectiveAnswer(stage.answer, String(stage.answer), { tolerance: stage.answerTolerance }),
            `${context} stage ${i + 1}`,
          ).toBe(true);
        });
      });
    }
  });

  test('case-enhanced-1: the diagonal and the named location', () => {
    eachStory('case-enhanced-1', (story, context) => {
      const [one, two] = story.stages;
      const [, a, b] = match(one.question, /is (\d+)m × (\d+)m\./, context);
      expect(one.answer, context).toBe(Math.hypot(Number(a), Number(b)));
      const [, first, narrow, second, wide] = match(
        two.question, /^The (.+?) was (\d+)m wide\. The (.+?) is (\d+)m wide\./, context,
      );
      expect(Number(narrow), context).toBeLessThan(Number(wide));
      expect([first, second], context).toContain(two.answer);
    });
  });

  test('case-enhanced-2: circle theorem angles', () => {
    eachStory('case-enhanced-2', (story, context) => {
      const [one, two] = story.stages;
      const centre = Number(match(one.question, /^Centre angle = (\d+)°\. Circumference angle = centre angle ÷ 2 = \?$/, context)[1]);
      expect(one.answer, context).toBe(centre / 2);
      const angle = Number(match(two.question, /^One angle = (\d+)°\. Opposite angle = 180° − (\d+)° = \?$/, context)[1]);
      expect(two.question, context).toContain(`180° − ${angle}°`);
      expect(two.answer, context).toBe(180 - angle);
    });
  });

  test('case-enhanced-3: heights are rounded to the metre, the question says so, the exact value is accepted', () => {
    eachStory('case-enhanced-3', (story, context) => {
      for (const stage of story.stages) {
        const [, adjacent, angle] = match(stage.question, /= (\d+) × tan\((\d+)°\)/, context);
        const exact = Number(adjacent) * Math.tan((Number(angle) * Math.PI) / 180);
        expect(stage.answer, context).toBe(Math.round(exact));
        expect(stage.question, context).toMatch(/nearest metre/);
        expect(stage.answerTolerance, context).toBe(0.5);
        expect(checkDetectiveAnswer(stage.answer, exact.toFixed(2), { tolerance: stage.answerTolerance }), context).toBe(true);
        expect(checkDetectiveAnswer(stage.answer, String(Math.round(exact) + 1), { tolerance: stage.answerTolerance }), context).toBe(false);
      }
    });
  });

  test('case-enhanced-7: GST amounts and the rounded base price', () => {
    eachStory('case-enhanced-7', (story, context) => {
      const [one, two, three] = story.stages;
      const [, pct, amount] = match(one.question, /^GST = (\d+)% of ₹(\d+)/, context);
      expect(one.answer, context).toBe((Number(pct) * Number(amount)) / 100);
      expect(two.answer, context).toBe(Number(match(two.question, /^Total GST = ₹(\d+)/, context)[1]) / 2);
      const [, total, rate] = match(three.question, /^Total \(incl\. GST\) = ₹(\d+)\. GST rate = (\d+)%/, context);
      const exact = (Number(total) * 100) / (100 + Number(rate));
      expect(three.answer, context).toBe(Math.round(exact));
      expect(three.question, context).toMatch(/nearest rupee/);
      expect(checkDetectiveAnswer(three.answer, exact.toFixed(2), { tolerance: three.answerTolerance }), context).toBe(true);
    });
  });

  test('case-enhanced-8: dividends and returns to 2 decimal places', () => {
    eachStory('case-enhanced-8', (story, context) => {
      const [one, two, three] = story.stages;
      const [, pct, fv, shares] = match(one.question, /^Dividend per share = (\d+)% of ₹(\d+)\. Total for (\d+) shares/, context);
      expect(one.answer, context).toBe((Number(pct) * Number(fv) * Number(shares)) / 100);
      const [, n1, mp1, div1] = match(two.question, /^Investment = (\d+) × ₹(\d+) = \? ROI = \(₹(\d+) ÷ investment\)/, context);
      expect(two.answer, context).toBe(Math.round((Number(div1) / (Number(n1) * Number(mp1))) * 10000) / 100);
      expect(two.question, context).toMatch(/2 decimal places/);
      const [, n2, pct2, fv2, mp2] = match(three.question, /^Dividend = (\d+) × (\d+)% of ₹(\d+)\. Investment = \d+ × ₹(\d+)\./, context);
      const dividend = (Number(n2) * Number(pct2) * Number(fv2)) / 100;
      expect(three.answer, context).toBe(Math.round((dividend / (Number(n2) * Number(mp2))) * 10000) / 100);
      expect(three.question, context).toMatch(/2 decimal places/);
      expect(story.stages[2].evidence.text, context).not.toMatch(/suspiciously close/);
    });
  });

  test('case-enhanced-9: profit and selling price after a loss', () => {
    eachStory('case-enhanced-9', (story, context) => {
      const [one, two] = story.stages;
      const [, sp, cp] = match(one.question, /= (\d+) − (\d+) = \?$/, context);
      expect(one.answer, context).toBe(Number(sp) - Number(cp));
      const [, pct, cost] = match(two.question, /^Loss = (\d+)% of (\d+) = \?/, context);
      expect(two.answer, context).toBe(Number(cost) - (Number(pct) * Number(cost)) / 100);
    });
  });

  test('case-enhanced-10: the dice question asks for what is stored', () => {
    eachStory('case-enhanced-10', (story, context) => {
      const two = story.stages[1];
      expect(two.question, context).toMatch(/Probability = favorable outcomes ÷ 36/);
      expect(two.question, context).not.toMatch(/Number of favorable/);
    });
  });

  test('case-enhanced-11: mean and median, with a proper ordinal in the hint', () => {
    eachStory('case-enhanced-11', (story, context) => {
      const [one, two] = story.stages;
      const data = match(one.question, /^Data: (.+)\. Mean/, context)[1].split(', ').map(Number);
      expect(one.answer, context).toBe(data.reduce((a, b) => a + b, 0) / data.length);
      const sorted = match(two.question, /^Sorted data: (.+)\. Median/, context)[1].split(', ').map(Number);
      expect(two.answer, context).toBe(sorted[Math.floor(sorted.length / 2)]);
      expect(two.hints.join(' '), context).toMatch(/the \d+(st|nd|rd|th) value/);
    });
  });

  test('case-enhanced-12: permutations, combinations and factorials, terms written in full', () => {
    const factorial = n => (n <= 1 ? 1 : n * factorial(n - 1));
    eachStory('case-enhanced-12', (story, context) => {
      const [one, two, three] = story.stages;
      const [, n1, r1] = match(one.question, /^P\((\d+), (\d+)\)/, context);
      expect(one.answer, context).toBe(factorial(Number(n1)) / factorial(Number(n1) - Number(r1)));
      const expectedTerms = Array.from({ length: Number(r1) }, (_, i) => Number(n1) - i).join(' × ');
      expect(one.hints[0], context).toContain(`= ${expectedTerms} (`);
      const [, n2, r2] = match(two.question, /^C\((\d+), (\d+)\)/, context);
      expect(two.answer, context).toBe(factorial(Number(n2)) / (factorial(Number(r2)) * factorial(Number(n2) - Number(r2))));
      const letters = Number(match(three.question, /^Arrange all (\d+) letters/, context)[1]);
      expect(three.answer, context).toBe(factorial(letters));
    });
  });

  test('case-enhanced-13: derivatives, with two different powers written as a textbook would', () => {
    eachStory('case-enhanced-13', (story, context) => {
      const [one, two, three] = story.stages;
      const [, c1, n1] = match(one.question, /^f\(x\) = (\d+)x\^(\d+)\. f'\(x\)/, context);
      expect(one.answer, context).toBe(`${Number(c1) * Number(n1)}x^${Number(n1) - 1}`);

      const [, poly, at] = match(two.question, /^f\(x\) = (.+)\. Find f'\((\d+)\)\.$/, context);
      const terms = poly.split(' + ').map(term => {
        const [, coefficient, power] = match(term, /^(\d*)x(?:\^(\d+))?$/, context);
        return { coefficient: coefficient === '' ? 1 : Number(coefficient), power: power === undefined ? 1 : Number(power) };
      });
      expect(new Set(terms.map(t => t.power)).size, `${context}: ${poly}`).toBe(terms.length);
      expect(poly, context).not.toMatch(/(^|[^\d])1x/);
      const slope = terms.reduce((sum, t) => sum + t.coefficient * t.power * Number(at) ** (t.power - 1), 0);
      expect(two.answer, context).toBe(slope);

      const [, a, b, outer, at3] = match(three.question, /^f\(x\) = \((\d+)x \+ (\d+)\)\^(\d+)\. Find f'\((\d+)\)\.$/, context);
      expect(three.answer, context).toBe(Number(outer) * Number(a) * (Number(a) * Number(at3) + Number(b)) ** (Number(outer) - 1));
    });
  });

  test('case-enhanced-14: integrals are exact fractions that an equivalent answer also matches', () => {
    eachStory('case-enhanced-14', (story, context) => {
      const [one, two, three] = story.stages;
      const [, c, n, k] = match(one.question, /^∫\((\d*)x\^(\d+) \+ (\d+)\) dx = \?$/, context);
      expect(one.question, context).not.toMatch(/\(1x/);
      const coefficient = (c === '' ? 1 : Number(c)) / (Number(n) + 1);
      expect(checkDetectiveAnswer(one.answer, `${coefficient.toFixed(4)}x^${Number(n) + 1} + ${k}x + C`), context).toBe(true);
      expect(checkDetectiveAnswer(one.answer, `${coefficient + 1}x^${Number(n) + 1} + ${k}x + C`), context).toBe(false);
      expect(one.evidence.text, context).not.toMatch(/\d\.\d{4,}/);

      const [, lo, hi, cc, pp] = match(two.question, /^∫ from (\d+) to (\d+) of (\d+)x\^(\d+) dx/, context);
      const definite = (Number(cc) * (Number(hi) ** (Number(pp) + 1) - Number(lo) ** (Number(pp) + 1))) / (Number(pp) + 1);
      expect(checkDetectiveAnswer(two.answer, definite.toFixed(2)), context).toBe(true);
      expect(checkDetectiveAnswer(two.answer, String(definite + 1)), context).toBe(false);

      const [, lo3, hi3, c3] = match(three.question, /^∫ from (\d+) to (\d+) of (\d*)x² dx/, context);
      const area = ((c3 === '' ? 1 : Number(c3)) * (Number(hi3) ** 3 - Number(lo3) ** 3)) / 3;
      expect(checkDetectiveAnswer(three.answer, area.toFixed(2)), context).toBe(true);
      expect(checkDetectiveAnswer(three.answer, String(area + 1)), context).toBe(false);
    });
  });

  test('case-enhanced-16: page numbers and equations', () => {
    eachStory('case-enhanced-16', (story, context) => {
      const [one, two, three] = story.stages;
      expect(one.answer, context).toBe((Number(match(one.question, /add up to (\d+)\./, context)[1]) + 1) / 2);
      const [, a, b, c] = match(two.question, /^(\d+)x \+ (\d+) = (\d+)\. Solve/, context);
      expect(two.answer, context).toBe((Number(c) - Number(b)) / Number(a));
      const [, p, q, d, e] = match(three.question, /^\((\d+)x \+ (\d+)\) ÷ (\d+) = (\d+)\. Solve/, context);
      expect(three.answer, context).toBe((Number(e) * Number(d) - Number(q)) / Number(p));
    });
  });
});

import { createClient } from '@supabase/supabase-js';
import fermatsLastData from '../../src/data/fermats-last.json';
import pythagoreanData from '../../src/data/pythagorean.json';
import eulerFormulaData from '../../src/data/euler-formula.json';
import fundamentalTheoremData from '../../src/data/fundamental-theorem.json';
import infinitePiData from '../../src/data/infinite-pi.json';
import goldbachConjectureData from '../../src/data/goldbach-conjecture.json';
import banachTarskiData from '../../src/data/banach-tarski.json';

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE';
const supabase = createClient(supabaseUrl, supabaseKey);

const QUESTION_BANKS = {
  'fermats-last': fermatsLastData,
  'pythagorean': pythagoreanData,
  'euler-formula': eulerFormulaData,
  'fundamental-theorem': fundamentalTheoremData,
  'infinite-pi': infinitePiData,
  'goldbach-conjecture': goldbachConjectureData,
  'banach-tarski': banachTarskiData,
};

const THEOREM_META = {
  'pythagorean': { title: 'Pythagorean Theorem', core_idea: 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.', icon: 'pythagorean', color: 'bg-amber-400/20' },
  'fermats-last': { title: "Fermat's Last Theorem", core_idea: 'No three positive integers satisfy aⁿ + bⁿ = cⁿ for any integer n greater than two.', icon: 'fermats-last', color: 'bg-teal-400/20' },
  'euler-formula': { title: "Euler's Identity", core_idea: 'e^(iπ) + 1 = 0 — the most beautiful equation connecting five fundamental constants.', icon: 'euler-formula', color: 'bg-purple-400/20' },
  'fundamental-theorem': { title: 'Fundamental Theorem of Calculus', core_idea: 'Integration and differentiation are inverse operations.', icon: 'fundamental-theorem', color: 'bg-green-400/20' },
  'infinite-pi': { title: 'Leibniz Formula for π', core_idea: 'π can be computed by an infinite series: π/4 = 1 - 1/3 + 1/5 - 1/7 + ...', icon: 'infinite-pi', color: 'bg-blue-400/20' },
  'goldbach-conjecture': { title: "Goldbach's Conjecture", core_idea: 'Every even integer greater than 2 is the sum of two prime numbers.', icon: 'goldbach-conjecture', color: 'bg-coral-400/20' },
  'banach-tarski': { title: 'Banach-Tarski Paradox', core_idea: 'A solid sphere can be decomposed and reassembled into two identical copies of itself.', icon: 'banach-tarski', color: 'bg-pink-400/20' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Seed case_studies
    const caseStudies = Object.entries(THEOREM_META).map(([id, meta]) => {
      const kb = QUESTION_BANKS[id];
      return {
        id,
        title: meta.title,
        core_idea: meta.core_idea,
        story_intro: kb.story.intro,
        real_world: kb.story.applications,
        icon: meta.icon,
        color: meta.color,
      };
    });

    const { error: csError } = await supabase.from('case_studies').upsert(caseStudies, { onConflict: 'id' });
    if (csError) throw csError;

    // Seed stages
    const allStages = [];
    for (const [caseStudyId, kb] of Object.entries(QUESTION_BANKS)) {
      for (const stage of kb.stages) {
        allStages.push({
          id: `${caseStudyId}-stage-${stage.id}`,
          case_study_id: caseStudyId,
          stage_number: stage.id,
          concept_label: stage.conceptLabel,
          question: stage.question,
          hint: stage.hint,
          type: stage.type,
          accepted_answers: stage.acceptedAnswers,
          concept_shown: stage.conceptShown,
        });
      }
    }

    const { error: stageError } = await supabase.from('stages').upsert(allStages, { onConflict: 'id' });
    if (stageError) throw stageError;

    return res.json({ message: 'Seed complete', caseStudies: caseStudies.length, stages: allStages.length });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
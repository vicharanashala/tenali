import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Import data
import fermatsLastData from '../src/data/fermats-last.json';
import pythagoreanData from '../src/data/pythagorean.json';
import eulerFormulaData from '../src/data/euler-formula.json';
import fundamentalTheoremData from '../src/data/fundamental-theorem.json';
import infinitePiData from '../src/data/infinite-pi.json';
import goldbachConjectureData from '../src/data/goldbach-conjecture.json';
import banachTarskiData from '../src/data/banach-tarski.json';

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
  'pythagorean': { title: 'Pythagorean Theorem', coreIdea: 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.', icon: 'pythagorean', color: 'bg-amber-400/20' },
  'fermats-last': { title: "Fermat's Last Theorem", coreIdea: 'No three positive integers satisfy aⁿ + bⁿ = cⁿ for any integer n greater than two.', icon: 'fermats-last', color: 'bg-teal-400/20' },
  'euler-formula': { title: "Euler's Identity", coreIdea: 'e^(iπ) + 1 = 0 — the most beautiful equation connecting five fundamental constants.', icon: 'euler-formula', color: 'bg-purple-400/20' },
  'fundamental-theorem': { title: 'Fundamental Theorem of Calculus', coreIdea: 'Integration and differentiation are inverse operations.', icon: 'fundamental-theorem', color: 'bg-green-400/20' },
  'infinite-pi': { title: 'Leibniz Formula for π', coreIdea: 'π can be computed by an infinite series: π/4 = 1 - 1/3 + 1/5 - 1/7 + ...', icon: 'infinite-pi', color: 'bg-blue-400/20' },
  'goldbach-conjecture': { title: "Goldbach's Conjecture", coreIdea: 'Every even integer greater than 2 is the sum of two prime numbers.', icon: 'goldbach-conjecture', color: 'bg-coral-400/20' },
  'banach-tarski': { title: 'Banach-Tarski Paradox', coreIdea: 'A solid sphere can be decomposed and reassembled into two identical copies of itself.', icon: 'banach-tarski', color: 'bg-pink-400/20' },
};

async function seed() {
  console.log('Starting seed data...');

  // Check if already seeded
  const { data: existing } = await supabase.from('case_studies').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('Already seeded, skipping...');
    return;
  }

  // Seed case_studies
  const caseStudies = [];
  for (const [id, meta] of Object.entries(THEOREM_META)) {
    const kb = QUESTION_BANKS[id];
    caseStudies.push({
      id,
      title: meta.title,
      core_idea: meta.coreIdea,
      story_intro: kb.story.intro,
      real_world: kb.story.applications,
      icon: meta.icon,
      color: meta.color,
    });
  }

  console.log('Inserting case_studies...');
  for (const cs of caseStudies) {
    const { error } = await supabase.from('case_studies').upsert([cs], { onConflict: 'id' });
    if (error) {
      console.error('Error inserting case_study:', cs.id, error);
    } else {
      console.log('Inserted case_study:', cs.id);
    }
  }

  // Seed stages
  console.log('Inserting stages...');
  for (const [caseStudyId, kb] of Object.entries(QUESTION_BANKS)) {
    for (const stage of kb.stages) {
      const { error } = await supabase.from('stages').upsert([{
        id: `${caseStudyId}-stage-${stage.id}`,
        case_study_id: caseStudyId,
        stage_number: stage.id,
        concept_label: stage.conceptLabel,
        question: stage.question,
        hint: stage.hint,
        type: stage.type,
        accepted_answers: stage.acceptedAnswers,
        concept_shown: stage.conceptShown,
      }], { onConflict: 'id' });
      if (error) {
        console.error('Error inserting stage:', caseStudyId, stage.id, error);
      } else {
        console.log('Inserted stage:', caseStudyId, stage.id);
      }
    }
  }

  console.log('Seed complete!');
}

seed().catch(console.error);
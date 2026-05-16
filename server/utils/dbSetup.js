import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import theorems from '../../src/data/theorems.json';
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

async function setup() {
  console.log('Starting database setup...');

  // 1. Create tables
  console.log('Creating tables...');

  // case_studies
  await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS case_studies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        core_idea TEXT,
        story_intro TEXT,
        real_world TEXT[],
        icon TEXT,
        color TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }).catch(() => {
    // Fallback: try raw REST
    console.log('Using direct insert for case_studies table creation');
  });

  // Actually let's use the REST API to create tables via SQL
  // We need to use supabase's built-in SQL runner
  // Let's try a different approach - use the schema endpoint

  // Create tables via POST to a setup endpoint
  const { error } = await supabase.from('_dummy').select('*').limit(1);
  if (error && error.message.includes('does not exist')) {
    console.log('Testing connection...');
  }

  console.log('Creating case_studies table via SQL...');
  const tablesSQL = `
    CREATE TABLE IF NOT EXISTS case_studies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      core_idea TEXT,
      story_intro TEXT,
      real_world TEXT[],
      icon TEXT,
      color TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS stages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
      stage_number INTEGER NOT NULL,
      concept_label TEXT,
      question TEXT,
      hint TEXT,
      type TEXT,
      accepted_answers TEXT[],
      concept_shown TEXT
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
      current_stage INTEGER DEFAULT 0,
      status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'mastered')),
      xp_earned INTEGER DEFAULT 0,
      completed_at TIMESTAMPTZ,
      last_updated TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, case_study_id)
    );

    CREATE TABLE IF NOT EXISTS user_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      case_study_id UUID,
      stage_number INTEGER,
      answer_given TEXT,
      is_correct BOOLEAN,
      xp_earned INTEGER DEFAULT 0,
      attempted_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Execute raw SQL - we'll use a workaround since there's no direct SQL exec API in client
  // We'll do it by creating a temporary function approach
  try {
    const result = await supabase.query(tablesSQL);
    console.log('Tables created:', result);
  } catch (e) {
    console.log('Query approach failed, trying alternative...');
  }

  console.log('Setup complete - use Supabase SQL editor for full schema');
  console.log('');
  console.log('RUN THIS SQL IN SUPABASE SQL EDITOR:');
  console.log('');
  console.log(tablesSQL);
  console.log('');
  console.log('Then run the seed data script separately.');
}

setup().catch(console.error);
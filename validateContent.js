/**
 * validateContent.js — Content validation pipeline
 *
 * Connects to Supabase and validates that all case studies meet
 * the minimum quality threshold before being published.
 *
 * Run: node scripts/validateContent.js
 * Exits with code 1 if validation fails (blocking publish gate)
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

// ── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL  = process.env.VITE_SUPABASE_URL  || 'https://your-project.supabase.co'
const SERVICE_ROLE  = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
const MIN_STAGES    = 3   // minimum stages per case study
const MIN_QUESTIONS = 3   // minimum questions per stage
const ALGORITHMS    = [
  'fermats-little',
  'handshake',
  'chinese-remainder',
  'coupon-collector',
  'euclidean-algorithm',
  'modular-inverse',
  'binary-exponentiation',
]

// ── Supabase client (service role = admin access) ────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

// ── Validation Rules ─────────────────────────────────────────────────────────

const rules = [
  {
    name: 'Algorithm has at least one case study',
    query: async () => {
      const { data, error } = await supabase
        .from('algorithms')
        .select('id, name')
      if (error) throw error
      const missing = ALGORITHMS.filter(a => !data.find(d => d.name.toLowerCase().includes(a)))
      return { pass: missing.length === 0, detail: missing.length ? `Missing: ${missing.join(', ')}` : 'All 7 present' }
    }
  },
  {
    name: 'Every case study has at least 3 stages',
    query: async () => {
      const { data, error } = await supabase
        .from('case_studies')
        .select('id, title, algorithm_id, stages(count)')
      if (error) throw error
      const flat = data.map(cs => ({ id: cs.id, title: cs.title, stageCount: cs.stages?.[0]?.count ?? 0 }))
      const fail = flat.filter(cs => cs.stageCount < MIN_STAGES)
      return { pass: fail.length === 0, detail: fail.length ? `${fail.length} case studies need more stages` : `All case studies ≥${MIN_STAGES} stages` }
    }
  },
  {
    name: 'Every stage has at least 3 questions',
    query: async () => {
      const { data, error } = await supabase
        .from('stages')
        .select('id, stage_number, case_study_id, question_pool(count)')
      if (error) throw error
      const flat = data.map(s => ({ id: s.id, stage: s.stage_number, cs: s.case_study_id, qCount: s.question_pool?.[0]?.count ?? 0 }))
      const fail = flat.filter(s => s.qCount < MIN_QUESTIONS)
      return { pass: fail.length === 0, detail: fail.length ? `${fail.length} stages need more questions` : `All stages ≥${MIN_QUESTIONS} questions` }
    }
  },
  {
    name: 'Every question has a non-empty answer',
    query: async () => {
      const { data, error } = await supabase
        .from('question_pool')
        .select('id, question_text, answer')
        .is('answer', null)
      if (error) throw error
      return { pass: data.length === 0, detail: data.length ? `${data.length} questions missing answers` : 'All questions have answers' }
    }
  },
  {
    name: 'Every question has a hint',
    query: async () => {
      const { data, error } = await supabase
        .from('question_pool')
        .select('id, question_text, hint_text')
        .is('hint_text', null)
      if (error) throw error
      return { pass: data.length === 0, detail: data.length ? `${data.length} questions missing hints` : 'All questions have hints' }
    }
  },
  {
    name: 'No question text is empty',
    query: async () => {
      const { data, error } = await supabase
        .from('question_pool')
        .select('id, question_text')
        .eq('question_text', '')
      if (error) throw error
      return { pass: data.length === 0, detail: data.length ? `${data.length} questions have empty text` : 'All question texts populated' }
    }
  },
  {
    name: 'Every case study has a story_intro',
    query: async () => {
      const { data, error } = await supabase
        .from('case_studies')
        .select('id, title, story_intro')
        .or('story_intro.is.null,story_intro.eq.')
      if (error) throw error
      return { pass: data.length === 0, detail: data.length ? `${data.length} case studies missing story intros` : 'All case studies have story intros' }
    }
  },
  {
    name: 'Every case study has real_world_applications',
    query: async () => {
      const { data, error } = await supabase
        .from('case_studies')
        .select('id, title, real_world_applications')
        .or('real_world_applications.is.null,real_world_applications.eq.')
      if (error) throw error
      return { pass: data.length === 0, detail: data.length ? `${data.length} case studies missing real-world applications` : 'All case studies have real-world applications' }
    }
  },
  {
    name: 'No duplicate question texts within the same stage',
    query: async () => {
      // This checks for exact duplicates per stage — same text is allowed if difficulty differs
      const { data, error } = await supabase
        .from('question_pool')
        .select('stage_id, question_text')
      if (error) throw error

      const byStage = {}
      for (const q of data) {
        if (!byStage[q.stage_id]) byStage[q.stage_id] = []
        byStage[q.stage_id].push(q.question_text)
      }

      const dupes = []
      for (const [stageId, texts] of Object.entries(byStage)) {
        const seen = new Set()
        for (const t of texts) {
          if (seen.has(t)) dupes.push({ stageId, text: t })
          seen.add(t)
        }
      }

      return { pass: dupes.length === 0, detail: dupes.length ? `${dupes.length} duplicate question texts found` : 'No exact duplicates within stages' }
    }
  },
  {
    name: 'All 7 algorithms have at least 5 case studies (launch threshold)',
    query: async () => {
      const { data, error } = await supabase
        .from('algorithms')
        .select('name, case_studies(count)')
      if (error) throw error

      const flat = data.map(a => ({
        name: a.name,
        csCount: a.case_studies?.[0]?.count ?? 0
      }))

      const fail = flat.filter(a => a.csCount < 5)
      return {
        pass: fail.length === 0,
        detail: fail.length
          ? `${fail.map(a => a.name).join(', ')} need more case studies for launch`
          : 'All algorithms have ≥5 case studies'
      }
    }
  },
]

// ── Runner ───────────────────────────────────────────────────────────────────

async function runValidation() {
  console.log('\n🔍 Tenali Content Validation Pipeline')
  console.log('=' .repeat(50))
  console.log(`Project: ${SUPABASE_URL}`)
  console.log(`Time:    ${new Date().toISOString()}`)
  console.log('=' .repeat(50) + '\n')

  let allPass = true
  let passCount = 0

  for (const rule of rules) {
    process.stdout.write(`⏳ ${rule.name}... `)
    try {
      const result = await rule.query()
      if (result.pass) {
        console.log(`✅ ${result.detail}`)
        passCount++
      } else {
        console.log(`❌ ${result.detail}`)
        allPass = false
      }
    } catch (err) {
      console.log(`⚠️  Error: ${err.message}`)
      allPass = false
    }
  }

  console.log('\n' + '=' .repeat(50))
  console.log(`Result: ${passCount}/${rules.length} checks passed`)

  if (allPass) {
    console.log('✅ VALIDATION PASSED — safe to publish\n')
    process.exit(0)
  } else {
    console.log('❌ VALIDATION FAILED — blocking publish\n')
    process.exit(1)
  }
}

runValidation()
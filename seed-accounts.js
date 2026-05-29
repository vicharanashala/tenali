/**
 * seed-accounts.js — One-time seed script: create bypass researcher accounts
 *
 * Run with: node api/seed-accounts.js
 *
 * Creates the 7 researcher accounts in the `users` table with a shared
 * password (iit-ropar). Skips any account that already exists.
 *
 * These accounts bypass OTP verification (see register.js) and use
 * password-only auth for easier demo access.
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE'
const supabase = createClient(supabaseUrl, supabaseKey)

// Researcher accounts — OTP bypass enabled (see register.js)
const BYPASS_ACCOUNTS = [
  { email: 'sudarshan.iyengar@vicharanashala.ai', name: 'Sudarshan Iyengar' },
  { email: 'meenakshi.v@vicharanashala.ai',        name: 'Meenakshi V' },
  { email: 'harshdeep.r@vicharanashala.ai',         name: 'Harshdeep R' },
  { email: 'rohit.sharma@vicharanashala.ai',         name: 'Rohit Sharma' },
  { email: 'sakshi.sharma@vicharanashala.ai',        name: 'Sakshi Sharma' },
  { email: 'pavani.a@vicharanashala.ai',            name: 'Pavani A' },
  { email: 'prakash.hegade@vicharanashala.ai',      name: 'Prakash Hegade' },
]

// Shared password for all bypass accounts
const PASSWORD = 'iitropar'

async function seed() {
  for (const account of BYPASS_ACCOUNTS) {
    try {
      // Skip if user already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', account.email)
        .maybeSingle()

      if (existing) {
        console.log(`⏭️  Already exists: ${account.email}`)
        continue
      }

      const hashed = await bcrypt.hash(PASSWORD, 10)
      const { data, error } = await supabase
        .from('users')
        .insert({ email: account.email, name: account.name, password: hashed })
        .select('id')
        .single()

      if (error) throw error
      console.log(`✅ Created: ${account.email} (id: ${data.id})`)
    } catch (err) {
      console.error(`❌ Failed for ${account.email}: ${err.message}`)
    }
  }
  console.log('\nDone!')
}

seed()
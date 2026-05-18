/**
 * supabase.js — Supabase client singleton
 *
 * Creates and exports a Supabase browser client configured with
 * the project's anon key. Used by useAuth.js for authentication
 * state management and by lib functions that need direct DB access.
 *
 * In production the anon key is safe to expose in the browser;
 * Row Level Security (RLS) policies on the Supabase project
 * enforce access control at the database level.
 */

import { createClient } from '@supabase/supabase-js'

// Supabase project URL and anon key (public, safe for browser)
const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
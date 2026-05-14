import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
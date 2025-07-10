import { createClient } from '@supabase/supabase-js'

// Fallback values for testing and build purposes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-project-id.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key-for-testing'

// Only warn in development, not during build
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Missing Supabase environment variables. Using fallback values for testing.')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 
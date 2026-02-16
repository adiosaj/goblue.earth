import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// DIAGNOSTIC: Log environment variable status (without exposing full values)
if (typeof window !== 'undefined') {
  console.log('🔍 Supabase Environment Check:', {
    hasUrl: !!supabaseUrl,
    urlLength: supabaseUrl.length,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey.length,
    keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
    allEnvVars: Object.keys(process.env).filter(key => key.includes('SUPABASE')).join(', '),
  })
}

// Create a dummy client for test mode if credentials are missing
const isTestMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')

let supabase: SupabaseClient

if (isTestMode) {
  // Use dummy values for test mode - client won't actually connect
  supabase = createClient(
    'https://dummy.supabase.co',
    'dummy-key'
  )
  if (typeof window !== 'undefined') {
    console.warn('🧪 Supabase credentials not found. Running in test mode.')
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Database types
export interface ChampEntry {
  id: string
  created_at: string
  first_name: string
  last_name: string
  age: number
  country: string
  city?: string
  timezone: string
  email: string
  linkedin_url?: string
  identity_choice: 'A' | 'B' | 'C'
  scenario1: 'A' | 'B' | 'C'
  scenario2: 'A' | 'B' | 'C'
  scenario3: 'A' | 'B' | 'C'
  scenario4: 'A' | 'B' | 'C'
  scenario5: 'A' | 'B' | 'C'
  shipped_text?: string
  created_link?: string
  project_text?: string
  availability_hours: number
  led_team: boolean
  handle_disagreement: string
  drains_most: string
  builder_score: number
  translator_score: number
  architect_score: number
  archetype_label: string
  hidden_tier: 'Tier1' | 'Tier2' | 'OpenNetwork'
  consent: boolean
}


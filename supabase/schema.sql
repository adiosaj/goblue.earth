-- GYC Champ Signal Mapper Database Schema
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS champ_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Identity Data
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  timezone TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_url TEXT,
  
  -- Quiz Answers
  identity_choice TEXT NOT NULL CHECK (identity_choice IN ('A', 'B', 'C')),
  scenario1 TEXT NOT NULL CHECK (scenario1 IN ('A', 'B', 'C')),
  scenario2 TEXT NOT NULL CHECK (scenario2 IN ('A', 'B', 'C')),
  scenario3 TEXT NOT NULL CHECK (scenario3 IN ('A', 'B', 'C')),
  scenario4 TEXT NOT NULL CHECK (scenario4 IN ('A', 'B', 'C')),
  scenario5 TEXT NOT NULL CHECK (scenario5 IN ('A', 'B', 'C')),
  
  -- Skill Signals
  shipped_text TEXT,
  created_link TEXT,
  project_text TEXT,
  
  -- Capacity & Stability
  availability_hours INTEGER NOT NULL,
  led_team BOOLEAN NOT NULL DEFAULT FALSE,
  handle_disagreement TEXT NOT NULL,
  drains_most TEXT NOT NULL,
  
  -- Calculated Scores
  builder_score NUMERIC(4, 2) NOT NULL,
  translator_score NUMERIC(4, 2) NOT NULL,
  architect_score NUMERIC(4, 2) NOT NULL,
  archetype_label TEXT NOT NULL,
  hidden_tier TEXT NOT NULL CHECK (hidden_tier IN ('Tier1', 'Tier2', 'OpenNetwork')),
  
  -- Consent
  consent BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_champ_entries_email ON champ_entries(email);

-- Create index on archetype for filtering
CREATE INDEX IF NOT EXISTS idx_champ_entries_archetype ON champ_entries(archetype_label);

-- Create index on tier for filtering
CREATE INDEX IF NOT EXISTS idx_champ_entries_tier ON champ_entries(hidden_tier);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_champ_entries_created_at ON champ_entries(created_at DESC);

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE champ_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from anyone (for the quiz)
CREATE POLICY "Allow public inserts" ON champ_entries
  FOR INSERT
  WITH CHECK (true);

-- Policy: Restrict selects (admin only - you'll need to implement auth)
-- For now, we'll allow selects but you should restrict this in production
CREATE POLICY "Allow public selects" ON champ_entries
  FOR SELECT
  USING (true);

-- Note: In production, you should:
-- 1. Remove the public select policy
-- 2. Create a service role key for admin access
-- 3. Use server-side API routes with service role key for admin operations


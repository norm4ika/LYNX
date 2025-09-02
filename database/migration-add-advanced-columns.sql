-- Add advanced columns to generations table for N8N integration
-- This migration adds columns that are used by the callback API

-- Add new columns to generations table
ALTER TABLE generations 
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,1) CHECK (quality_score >= 0 AND quality_score <= 10),
ADD COLUMN IF NOT EXISTS processing_time INTEGER, -- in milliseconds
ADD COLUMN IF NOT EXISTS commercial_style TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS brand_guidelines TEXT,
ADD COLUMN IF NOT EXISTS workflow_metadata JSONB,
ADD COLUMN IF NOT EXISTS n8n_execution_id TEXT,
ADD COLUMN IF NOT EXISTS workflow_version TEXT,
-- NEW: Supabase Storage and binary data metadata
ADD COLUMN IF NOT EXISTS supabase_storage_path TEXT,
ADD COLUMN IF NOT EXISTS image_size INTEGER; -- in bytes

-- Add RLS policy for service role to update generations (for callback endpoint)
CREATE POLICY "Service role can update generations" ON generations
  FOR UPDATE USING (
    -- Allow service role to update any generation
    auth.jwt() ->> 'role' = 'service_role' OR
    -- Keep existing user policy
    auth.uid() = user_id
  );

-- Create index for better performance on n8n_execution_id lookups
CREATE INDEX IF NOT EXISTS idx_generations_n8n_execution_id ON generations(n8n_execution_id);

-- Create index for quality_score filtering
CREATE INDEX IF NOT EXISTS idx_generations_quality_score ON generations(quality_score);

-- Update RLS policy to allow service role access
DROP POLICY IF EXISTS "Users can update own generations" ON generations;
CREATE POLICY "Users can update own generations" ON generations
  FOR UPDATE USING (
    -- Service role can update any generation (for N8N callbacks)
    auth.jwt() ->> 'role' = 'service_role' OR
    -- Users can update their own generations
    auth.uid() = user_id
  );

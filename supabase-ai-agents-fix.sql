-- Supabase AI Agents Table Fix
-- This script fixes the ai_agents_role_check constraint to allow custom agent roles
-- Copy and paste this entire script into Supabase SQL Editor

-- Step 1: Drop the existing constraint if it exists
ALTER TABLE IF EXISTS public.ai_agents 
DROP CONSTRAINT IF EXISTS ai_agents_role_check;

-- Step 2: Add the updated constraint with all allowed roles
ALTER TABLE public.ai_agents 
ADD CONSTRAINT ai_agents_role_check 
CHECK (role IN (
  'executive_assistant',
  'sales_rep',
  'customer_support',
  'marketing_strategist',
  'operations_manager',
  'project_manager',
  'analyst',
  'developer',
  'designer',
  'general_assistant',
  'custom'
));

-- Step 3: Verify the constraint was added successfully
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'ai_agents_role_check';

-- Step 4: Make created_by and team_id nullable (optional for development)
ALTER TABLE public.ai_agents 
ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE public.ai_agents 
ALTER COLUMN team_id DROP NOT NULL;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ AI Agents table constraint updated successfully!';
  RAISE NOTICE '✅ The following roles are now allowed:';
  RAISE NOTICE '   - executive_assistant (Aurora)';
  RAISE NOTICE '   - sales_rep (Vega)';
  RAISE NOTICE '   - customer_support (Luma)';
  RAISE NOTICE '   - marketing_strategist (Orion)';
  RAISE NOTICE '   - operations_manager (Titan)';
  RAISE NOTICE '   - project_manager';
  RAISE NOTICE '   - analyst';
  RAISE NOTICE '   - developer';
  RAISE NOTICE '   - designer';
  RAISE NOTICE '   - general_assistant';
  RAISE NOTICE '   - custom';
END $$;


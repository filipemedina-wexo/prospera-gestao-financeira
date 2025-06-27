-- Fix unique constraint for saas_user_client_mapping to allow multiple inactive mappings
-- and enforce uniqueness only for active mappings

-- Remove existing constraint
ALTER TABLE public.saas_user_client_mapping
DROP CONSTRAINT IF EXISTS unique_user_active_mapping;

-- Create partial unique index ensuring only one active mapping per user
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_active_mapping
ON public.saas_user_client_mapping (user_id)
WHERE is_active = true;

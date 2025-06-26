
-- First, let's clean up duplicate entries in saas_user_client_mapping
-- Keep only the most recent mapping for each user
WITH ranked_mappings AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM public.saas_user_client_mapping
  WHERE is_active = true
)
DELETE FROM public.saas_user_client_mapping 
WHERE id IN (
  SELECT id FROM ranked_mappings WHERE rn > 1
);

-- Add a unique constraint to prevent future duplicates
ALTER TABLE public.saas_user_client_mapping 
DROP CONSTRAINT IF EXISTS unique_user_active_mapping;

ALTER TABLE public.saas_user_client_mapping 
ADD CONSTRAINT unique_user_active_mapping 
UNIQUE (user_id, is_active) 
DEFERRABLE INITIALLY DEFERRED;

-- Update the get_user_client_id function to be more robust
CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT client_id 
  FROM public.saas_user_client_mapping 
  WHERE user_id = auth.uid() 
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
$$;


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

-- Ensure RLS is enabled and policies are in place
ALTER TABLE public.saas_user_client_mapping ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own client mappings" ON public.saas_user_client_mapping;
DROP POLICY IF EXISTS "Super admins can view all user client mappings" ON public.saas_user_client_mapping;
DROP POLICY IF EXISTS "Super admins can manage all user client mappings" ON public.saas_user_client_mapping;

-- Create new policies for saas_user_client_mapping
CREATE POLICY "Super admins can view all user client mappings" 
ON public.saas_user_client_mapping 
FOR SELECT 
USING (public.is_super_admin());

CREATE POLICY "Users can view their own client mappings" 
ON public.saas_user_client_mapping 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all user client mappings" 
ON public.saas_user_client_mapping 
FOR ALL 
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Drop existing policies for saas_client_user_assignments if they exist
DROP POLICY IF EXISTS "Super admins can view all user assignments" ON public.saas_client_user_assignments;
DROP POLICY IF EXISTS "Users can view assignments from their client" ON public.saas_client_user_assignments;
DROP POLICY IF EXISTS "Super admins can manage all user assignments" ON public.saas_client_user_assignments;

-- Enable RLS for saas_client_user_assignments
ALTER TABLE public.saas_client_user_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for saas_client_user_assignments
CREATE POLICY "Super admins can view all user assignments" 
ON public.saas_client_user_assignments 
FOR SELECT 
USING (public.is_super_admin());

CREATE POLICY "Users can view assignments from their client" 
ON public.saas_client_user_assignments 
FOR SELECT 
USING (public.user_belongs_to_client(client_id));

CREATE POLICY "Super admins can manage all user assignments" 
ON public.saas_client_user_assignments 
FOR ALL 
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

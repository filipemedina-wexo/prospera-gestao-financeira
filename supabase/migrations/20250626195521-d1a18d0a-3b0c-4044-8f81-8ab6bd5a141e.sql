
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own client mappings" ON public.saas_user_client_mapping;
DROP POLICY IF EXISTS "Super admins can view all user client mappings" ON public.saas_user_client_mapping;
DROP POLICY IF EXISTS "Super admins can manage all user client mappings" ON public.saas_user_client_mapping;

-- Enable RLS if not already enabled
ALTER TABLE public.saas_user_client_mapping ENABLE ROW LEVEL SECURITY;

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

-- Clean duplicate data in saas_user_client_mapping
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY user_id, client_id ORDER BY created_at DESC) as rn
  FROM public.saas_user_client_mapping
)
DELETE FROM public.saas_user_client_mapping 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_user_client_active'
    ) THEN
        ALTER TABLE public.saas_user_client_mapping 
        ADD CONSTRAINT unique_user_client_active 
        UNIQUE (user_id, client_id, is_active);
    END IF;
END $$;

-- Create function for getting user client ID
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

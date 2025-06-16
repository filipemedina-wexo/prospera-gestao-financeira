
-- Create client_account_categories table for managing client-specific categories
CREATE TABLE public.client_account_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for client_account_categories
ALTER TABLE public.client_account_categories ENABLE ROW LEVEL SECURITY;

-- Users can only see categories from their own client
CREATE POLICY "Users can view their client categories" ON public.client_account_categories
  FOR SELECT USING (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

-- Users can create categories for their client
CREATE POLICY "Users can create their client categories" ON public.client_account_categories
  FOR INSERT WITH CHECK (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

-- Users can update categories from their client
CREATE POLICY "Users can update their client categories" ON public.client_account_categories
  FOR UPDATE USING (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

-- Users can delete categories from their client
CREATE POLICY "Users can delete their client categories" ON public.client_account_categories
  FOR DELETE USING (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

-- Add trigger to update updated_at column
CREATE TRIGGER update_client_account_categories_updated_at
  BEFORE UPDATE ON public.client_account_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

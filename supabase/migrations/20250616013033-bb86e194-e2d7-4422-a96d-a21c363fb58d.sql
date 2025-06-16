
-- Create table for tracking user assignments to SaaS clients
CREATE TABLE IF NOT EXISTS public.saas_client_user_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'user',
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, user_id)
);

-- Create table for subscription payment history
CREATE TABLE IF NOT EXISTS public.saas_payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.saas_subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for client configuration templates
CREATE TABLE IF NOT EXISTS public.saas_client_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
  configuration_key TEXT NOT NULL,
  configuration_value JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, configuration_key)
);

-- Enable RLS on new tables
ALTER TABLE public.saas_client_user_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_client_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policies for saas_client_user_assignments
CREATE POLICY "Super admins can manage all user assignments" ON public.saas_client_user_assignments
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view their own assignments" ON public.saas_client_user_assignments
  FOR SELECT USING (user_id = auth.uid());

-- RLS policies for saas_payment_history
CREATE POLICY "Super admins can view all payment history" ON public.saas_payment_history
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY "Super admins can manage payment history" ON public.saas_payment_history
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- RLS policies for saas_client_configurations
CREATE POLICY "Super admins can manage all client configurations" ON public.saas_client_configurations
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view their client configurations" ON public.saas_client_configurations
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM public.saas_user_client_mapping 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Add updated_at trigger for new tables
CREATE TRIGGER update_saas_client_user_assignments_updated_at
  BEFORE UPDATE ON public.saas_client_user_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saas_client_configurations_updated_at
  BEFORE UPDATE ON public.saas_client_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize client with default data
CREATE OR REPLACE FUNCTION public.initialize_client_data(client_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert default configurations
  INSERT INTO public.saas_client_configurations (client_id, configuration_key, configuration_value, is_default)
  VALUES 
    (client_id_param, 'company_settings', '{"currency": "BRL", "timezone": "America/Sao_Paulo", "language": "pt-BR"}'::jsonb, true),
    (client_id_param, 'financial_settings', '{"fiscal_year_start": "01-01", "default_payment_terms": 30}'::jsonb, true),
    (client_id_param, 'system_settings', '{"auto_backup": true, "notification_emails": true}'::jsonb, true);

  -- Log the initialization
  INSERT INTO public.security_audit_log (
    user_id, action, resource_type, resource_id, success, metadata
  ) VALUES (
    auth.uid(), 'CLIENT_INITIALIZATION', 'saas_client', client_id_param::text, true,
    '{"initialized_configurations": ["company_settings", "financial_settings", "system_settings"]}'::jsonb
  );
END;
$$;

-- Function to generate and assign initial admin user for client
CREATE OR REPLACE FUNCTION public.create_client_admin_user(
  client_id_param UUID,
  admin_email TEXT,
  admin_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  temp_password TEXT;
  result JSONB;
BEGIN
  -- Generate secure temporary password
  temp_password := public.generate_secure_password();
  
  -- Return the result with password for super admin to share
  result := jsonb_build_object(
    'email', admin_email,
    'name', admin_name,
    'temporary_password', temp_password,
    'client_id', client_id_param
  );
  
  -- Log the admin user creation
  INSERT INTO public.security_audit_log (
    user_id, action, resource_type, resource_id, success, metadata
  ) VALUES (
    auth.uid(), 'CLIENT_ADMIN_CREATED', 'saas_client', client_id_param::text, true,
    jsonb_build_object('admin_email', admin_email, 'admin_name', admin_name)
  );
  
  RETURN result;
END;
$$;

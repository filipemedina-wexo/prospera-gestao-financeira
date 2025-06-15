
-- Create a profiles table for user information
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles - users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create table for client databases (for multi-tenancy)
CREATE TABLE public.client_databases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
  database_name text NOT NULL,
  database_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Enable RLS on client_databases (corrected syntax)
ALTER TABLE public.client_databases ENABLE ROW LEVEL SECURITY;

-- Only super admins can access client databases
CREATE POLICY "Super admins can manage client databases" ON public.client_databases
  FOR ALL USING (public.is_super_admin());

-- Create table for client onboarding status
CREATE TABLE public.client_onboarding (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
  setup_completed boolean NOT NULL DEFAULT false,
  admin_user_created boolean NOT NULL DEFAULT false,
  initial_data_created boolean NOT NULL DEFAULT false,
  welcome_email_sent boolean NOT NULL DEFAULT false,
  onboarding_completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Enable RLS on client_onboarding
ALTER TABLE public.client_onboarding ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage onboarding
CREATE POLICY "Super admins can manage onboarding" ON public.client_onboarding
  FOR ALL USING (public.is_super_admin());

-- Add RLS policies for saas_clients that allow super admins to manage everything
CREATE POLICY "Super admins can manage all saas clients" ON public.saas_clients
  FOR ALL USING (public.is_super_admin());

-- Add RLS policies for saas_subscriptions
ALTER TABLE public.saas_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all subscriptions" ON public.saas_subscriptions
  FOR ALL USING (public.is_super_admin());

-- Add RLS policies for saas_plans
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all plans" ON public.saas_plans
  FOR ALL USING (public.is_super_admin());

-- Add RLS policies for saas_analytics
ALTER TABLE public.saas_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all analytics" ON public.saas_analytics
  FOR ALL USING (public.is_super_admin());

-- Add triggers for updating updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_client_databases_updated_at
  BEFORE UPDATE ON public.client_databases
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_client_onboarding_updated_at
  BEFORE UPDATE ON public.client_onboarding
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

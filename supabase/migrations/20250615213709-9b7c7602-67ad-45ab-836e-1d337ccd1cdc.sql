
-- First, create the app_role enum if it doesn't exist
CREATE TYPE public.app_role AS ENUM ('admin', 'financeiro', 'comercial', 'contador');

-- Now add the super_admin role to the enum
ALTER TYPE public.app_role ADD VALUE 'super_admin';

-- Create the user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy for user_roles (users can only see their own roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Criar enum para tipos de planos SaaS
CREATE TYPE public.saas_plan_type AS ENUM ('basic', 'premium', 'enterprise');

-- Criar enum para status de assinatura
CREATE TYPE public.subscription_status AS ENUM ('active', 'inactive', 'suspended', 'cancelled', 'trial');

-- Criar enum para status de cliente SaaS
CREATE TYPE public.saas_client_status AS ENUM ('active', 'blocked', 'trial', 'suspended');

-- Tabela de clientes SaaS (diferentes dos clientes financeiros)
CREATE TABLE public.saas_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL UNIQUE,
    contact_phone TEXT,
    cnpj TEXT UNIQUE,
    address TEXT,
    city TEXT,
    state TEXT,
    status saas_client_status NOT NULL DEFAULT 'trial',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    blocked_reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE,
    blocked_by UUID REFERENCES auth.users(id)
);

-- Tabela de planos SaaS
CREATE TABLE public.saas_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type saas_plan_type NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10,2) NOT NULL,
    yearly_price DECIMAL(10,2),
    max_users INTEGER NOT NULL DEFAULT 1,
    features JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de assinaturas
CREATE TABLE public.saas_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.saas_plans(id),
    status subscription_status NOT NULL DEFAULT 'trial',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    monthly_price DECIMAL(10,2) NOT NULL,
    yearly_price DECIMAL(10,2),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de usuários dos clientes SaaS
CREATE TABLE public.saas_client_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(client_id, user_id)
);

-- Tabela de analytics/métricas SaaS
CREATE TABLE public.saas_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2),
    metric_data JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS em todas as tabelas SaaS
ALTER TABLE public.saas_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_analytics ENABLE ROW LEVEL SECURITY;

-- Função para verificar se o usuário é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  );
$$;

-- Políticas RLS para saas_clients - apenas super admins podem acessar
CREATE POLICY "Super admins can manage saas clients"
ON public.saas_clients
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Políticas RLS para saas_plans - apenas super admins podem acessar
CREATE POLICY "Super admins can manage saas plans"
ON public.saas_plans
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Políticas RLS para saas_subscriptions - apenas super admins podem acessar
CREATE POLICY "Super admins can manage saas subscriptions"
ON public.saas_subscriptions
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Políticas RLS para saas_client_users - apenas super admins podem acessar
CREATE POLICY "Super admins can manage saas client users"
ON public.saas_client_users
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Políticas RLS para saas_analytics - apenas super admins podem acessar
CREATE POLICY "Super admins can view saas analytics"
ON public.saas_analytics
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- Inserir alguns planos padrão
INSERT INTO public.saas_plans (name, type, description, monthly_price, yearly_price, max_users, features) VALUES
('Básico', 'basic', 'Plano básico para pequenas empresas', 99.90, 999.00, 3, '["Módulo Financeiro", "Relatórios Básicos", "Suporte por Email"]'),
('Premium', 'premium', 'Plano premium com recursos avançados', 199.90, 1999.00, 10, '["Todos os Módulos", "Relatórios Avançados", "CRM", "API Access", "Suporte Prioritário"]'),
('Enterprise', 'enterprise', 'Plano enterprise para grandes empresas', 399.90, 3999.00, 50, '["Todos os Recursos", "Customizações", "Integração Personalizada", "Suporte 24/7", "Consultor Dedicado"]');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_saas_clients_updated_at BEFORE UPDATE ON public.saas_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_saas_plans_updated_at BEFORE UPDATE ON public.saas_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_saas_subscriptions_updated_at BEFORE UPDATE ON public.saas_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_saas_client_users_updated_at BEFORE UPDATE ON public.saas_client_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

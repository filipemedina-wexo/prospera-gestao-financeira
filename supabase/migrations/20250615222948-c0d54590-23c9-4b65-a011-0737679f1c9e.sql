
-- Fase 1: Correções de Segurança - Implementar RLS nas tabelas faltantes (versão corrigida)

-- Habilitar RLS na tabela profiles (se ainda não estiver)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles (apenas se não existirem)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para user_roles (apenas se não existirem)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' AND policyname = 'Users can view own roles'
    ) THEN
        CREATE POLICY "Users can view own roles" ON public.user_roles
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' AND policyname = 'Super admins can manage all roles'
    ) THEN
        CREATE POLICY "Super admins can manage all roles" ON public.user_roles
          FOR ALL USING (public.is_super_admin());
    END IF;
END $$;

-- Habilitar RLS nas tabelas SaaS faltantes
ALTER TABLE public.saas_user_client_mapping ENABLE ROW LEVEL SECURITY;

-- Políticas para saas_user_client_mapping (apenas se não existirem)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'saas_user_client_mapping' AND policyname = 'Users can view own client mappings'
    ) THEN
        CREATE POLICY "Users can view own client mappings" ON public.saas_user_client_mapping
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'saas_user_client_mapping' AND policyname = 'Super admins can manage client mappings'
    ) THEN
        CREATE POLICY "Super admins can manage client mappings" ON public.saas_user_client_mapping
          FOR ALL USING (public.is_super_admin());
    END IF;
END $$;

-- Adicionar campo welcome_email_sent na tabela profiles se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS welcome_email_sent boolean NOT NULL DEFAULT false;

-- Fase 2: Configuração Inicial do SaaS - Criar cliente inicial
INSERT INTO public.saas_clients (
  id,
  company_name,
  contact_name,
  contact_email,
  status,
  created_at
) VALUES (
  gen_random_uuid(),
  'Prospera Admin',
  'Administrador',
  'medina@wexo.com.br',
  'active',
  now()
) ON CONFLICT (contact_email) DO NOTHING;

-- Associar o usuário super admin ao cliente inicial
INSERT INTO public.saas_user_client_mapping (
  user_id,
  client_id,
  role,
  is_active
)
SELECT 
  u.id,
  c.id,
  'admin',
  true
FROM auth.users u
CROSS JOIN public.saas_clients c
WHERE u.email = 'medina@wexo.com.br'
  AND c.company_name = 'Prospera Admin'
ON CONFLICT (user_id, client_id) DO NOTHING;

-- Criar plano básico se não existir
INSERT INTO public.saas_plans (
  id,
  name,
  description,
  type,
  monthly_price,
  yearly_price,
  max_users,
  features,
  is_active
) VALUES (
  gen_random_uuid(),
  'Plano Básico',
  'Plano básico para gestão financeira',
  'basic',
  99.00,
  990.00,
  5,
  '["Dashboard", "Contas a Pagar", "Contas a Receber", "Relatórios Básicos"]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- Criar assinatura para o cliente inicial
INSERT INTO public.saas_subscriptions (
  client_id,
  plan_id,
  status,
  billing_cycle,
  monthly_price,
  yearly_price,
  start_date,
  auto_renew
)
SELECT 
  c.id,
  p.id,
  'active',
  'monthly',
  p.monthly_price,
  p.yearly_price,
  now(),
  true
FROM public.saas_clients c
CROSS JOIN public.saas_plans p
WHERE c.company_name = 'Prospera Admin'
  AND p.name = 'Plano Básico'
ON CONFLICT DO NOTHING;

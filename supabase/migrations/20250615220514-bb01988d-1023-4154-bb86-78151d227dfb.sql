
-- Criar tabela para mapear usuários aos clientes SaaS
CREATE TABLE public.saas_user_client_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, client_id)
);

-- Habilitar RLS na tabela de mapeamento
ALTER TABLE public.saas_user_client_mapping ENABLE ROW LEVEL SECURITY;

-- Criar função para obter o client_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_client_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT client_id 
  FROM public.saas_user_client_mapping 
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$;

-- Criar função para verificar se usuário pertence a um cliente específico
CREATE OR REPLACE FUNCTION public.user_belongs_to_client(client_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.saas_user_client_mapping
    WHERE user_id = auth.uid() 
      AND client_id = client_uuid 
      AND is_active = true
  );
$$;

-- Políticas RLS para a tabela de mapeamento
CREATE POLICY "Users can view their own client mappings"
ON public.saas_user_client_mapping
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Super admins podem gerenciar todos os mapeamentos
CREATE POLICY "Super admins can manage all client mappings"
ON public.saas_user_client_mapping
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Criar tabelas isoladas por cliente para dados operacionais
-- Exemplo: Clientes financeiros (separados dos clientes SaaS)
CREATE TABLE public.financial_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contas a pagar isoladas por cliente
CREATE TABLE public.accounts_payable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
  financial_client_id UUID REFERENCES public.financial_clients(id),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contas a receber isoladas por cliente
CREATE TABLE public.accounts_receivable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
  financial_client_id UUID REFERENCES public.financial_clients(id),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  received_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas operacionais
ALTER TABLE public.financial_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para isolamento por cliente
CREATE POLICY "Users can only access their client's financial clients"
ON public.financial_clients
FOR ALL
TO authenticated
USING (public.user_belongs_to_client(saas_client_id))
WITH CHECK (public.user_belongs_to_client(saas_client_id));

CREATE POLICY "Users can only access their client's accounts payable"
ON public.accounts_payable
FOR ALL
TO authenticated
USING (public.user_belongs_to_client(saas_client_id))
WITH CHECK (public.user_belongs_to_client(saas_client_id));

CREATE POLICY "Users can only access their client's accounts receivable"
ON public.accounts_receivable
FOR ALL
TO authenticated
USING (public.user_belongs_to_client(saas_client_id))
WITH CHECK (public.user_belongs_to_client(saas_client_id));

-- Super admins podem acessar tudo
CREATE POLICY "Super admins can access all financial clients"
ON public.financial_clients
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can access all accounts payable"
ON public.accounts_payable
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can access all accounts receivable"
ON public.accounts_receivable
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Triggers para updated_at
CREATE TRIGGER update_saas_user_client_mapping_updated_at
  BEFORE UPDATE ON public.saas_user_client_mapping
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_clients_updated_at
  BEFORE UPDATE ON public.financial_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_payable_updated_at
  BEFORE UPDATE ON public.accounts_payable
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_receivable_updated_at
  BEFORE UPDATE ON public.accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

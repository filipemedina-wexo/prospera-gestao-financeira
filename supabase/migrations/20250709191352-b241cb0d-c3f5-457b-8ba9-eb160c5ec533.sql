-- Criar tabela para gerenciar módulos disponíveis por cliente
CREATE TABLE IF NOT EXISTS public.client_modules (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(client_id, module_name)
);

-- Habilitar RLS
ALTER TABLE public.client_modules ENABLE ROW LEVEL SECURITY;

-- Política para super admins
CREATE POLICY "Super admins can manage client modules"
ON public.client_modules
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para usuários verem módulos do seu cliente
CREATE POLICY "Users can view their client modules"
ON public.client_modules
FOR SELECT
USING (client_id = get_current_user_client_id());

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_client_modules_updated_at
    BEFORE UPDATE ON public.client_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir módulos padrão para todos os clientes existentes
INSERT INTO public.client_modules (client_id, module_name, is_enabled)
SELECT 
    id,
    module_name,
    true
FROM public.saas_clients, 
(VALUES 
    ('dashboard'),
    ('contas-pagar'),
    ('contas-receber'),
    ('caixa'),
    ('crm'),
    ('comercial'),
    ('produtos-servicos'),
    ('fornecedores'),
    ('relatorios'),
    ('dre'),
    ('pessoas'),
    ('configuracoes')
) AS modules(module_name)
ON CONFLICT (client_id, module_name) DO NOTHING;
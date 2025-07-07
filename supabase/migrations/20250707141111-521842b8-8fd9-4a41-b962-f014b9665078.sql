-- Correção da migração - Lidar com valores NULL/vazios em document_number

-- 1. Primeiro, remover a constraint única para document_number temporariamente
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_saas_client_id_document_number_key;

-- 2. Criar função corrigida para migrar dados
CREATE OR REPLACE FUNCTION migrate_financial_clients_to_clients_fixed()
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.clients (
        id, saas_client_id, company_name, contact_email, contact_phone, 
        document_number, address, city, state, zip_code, client_type, 
        created_at, updated_at
    )
    SELECT 
        id, saas_client_id, name, email, phone, 
        CASE 
            WHEN document IS NULL OR TRIM(document) = '' THEN NULL 
            ELSE document 
        END as document_number,
        address, city, state, cep, 'both',
        created_at, updated_at
    FROM public.financial_clients
    WHERE NOT EXISTS (
        SELECT 1 FROM public.clients c WHERE c.id = financial_clients.id
    );
END;
$$ LANGUAGE plpgsql;

-- 3. Executar migração corrigida
SELECT migrate_financial_clients_to_clients_fixed();

-- 4. Recriar constraint única, permitindo apenas um NULL por saas_client_id
CREATE UNIQUE INDEX clients_unique_document_per_client 
ON public.clients (saas_client_id, document_number) 
WHERE document_number IS NOT NULL AND TRIM(document_number) != '';

-- 5. Limpar registros duplicados vazios se existirem
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (
        PARTITION BY saas_client_id 
        ORDER BY created_at
    ) as rn
    FROM public.clients 
    WHERE document_number IS NULL OR TRIM(document_number) = ''
)
DELETE FROM public.clients 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 6. Atualizar referências nas tabelas de contas
UPDATE public.accounts_payable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

UPDATE public.accounts_receivable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

-- 7. Criar categorias padrão para facilitar o uso inicial
INSERT INTO public.categories (saas_client_id, name, type, description) 
SELECT DISTINCT 
    sc.id,
    'Geral',
    'expense',
    'Categoria padrão para despesas'
FROM public.saas_clients sc
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories c 
    WHERE c.saas_client_id = sc.id AND c.name = 'Geral' AND c.type = 'expense'
);

INSERT INTO public.categories (saas_client_id, name, type, description) 
SELECT DISTINCT 
    sc.id,
    'Geral',
    'income',
    'Categoria padrão para receitas'
FROM public.saas_clients sc
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories c 
    WHERE c.saas_client_id = sc.id AND c.name = 'Geral' AND c.type = 'income'
);

INSERT INTO public.categories (saas_client_id, name, type, description) 
SELECT DISTINCT 
    sc.id,
    'Produtos',
    'product',
    'Categoria padrão para produtos'
FROM public.saas_clients sc
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories c 
    WHERE c.saas_client_id = sc.id AND c.name = 'Produtos' AND c.type = 'product'
);

INSERT INTO public.categories (saas_client_id, name, type, description) 
SELECT DISTINCT 
    sc.id,
    'Serviços',
    'service',
    'Categoria padrão para serviços'
FROM public.saas_clients sc
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories c 
    WHERE c.saas_client_id = sc.id AND c.name = 'Serviços' AND c.type = 'service'
);
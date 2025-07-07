-- Remover trigger problemático e executar migração

-- 1. Remover a função e triggers problemáticos
DROP TRIGGER IF EXISTS create_financial_transaction_trigger ON public.accounts_payable;
DROP TRIGGER IF EXISTS create_financial_transaction_trigger ON public.accounts_receivable;
DROP FUNCTION IF EXISTS public.create_financial_transaction();

-- 2. Executar migração de dados
CREATE OR REPLACE FUNCTION migrate_financial_clients_to_clients()
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.clients (
        id, saas_client_id, company_name, contact_email, contact_phone, 
        document_number, address, city, state, zip_code, client_type, 
        created_at, updated_at
    )
    SELECT 
        fc.id, fc.saas_client_id, fc.name, fc.email, fc.phone, 
        CASE 
            WHEN fc.document IS NULL OR TRIM(fc.document) = '' THEN NULL 
            ELSE fc.document 
        END as document_number,
        fc.address, fc.city, fc.state, fc.cep, 'both',
        fc.created_at, fc.updated_at
    FROM public.financial_clients fc
    WHERE NOT EXISTS (
        SELECT 1 FROM public.clients c WHERE c.id = fc.id
    );
EXCEPTION
    WHEN others THEN
        NULL; -- Ignorar erros de duplicatas
END;
$$ LANGUAGE plpgsql;

SELECT migrate_financial_clients_to_clients();

-- 3. Atualizar referências
UPDATE public.accounts_payable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

UPDATE public.accounts_receivable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

-- 4. Criar categorias padrão se não existirem
DO $$
BEGIN
    -- Para cada cliente SaaS, criar categorias padrão
    INSERT INTO public.categories (saas_client_id, name, type, description)
    SELECT sc.id, 'Despesas Gerais', 'expense', 'Categoria padrão para despesas'
    FROM public.saas_clients sc
    WHERE NOT EXISTS (
        SELECT 1 FROM public.categories c 
        WHERE c.saas_client_id = sc.id AND c.name = 'Despesas Gerais' AND c.type = 'expense'
    );

    INSERT INTO public.categories (saas_client_id, name, type, description)
    SELECT sc.id, 'Receitas Gerais', 'income', 'Categoria padrão para receitas'
    FROM public.saas_clients sc
    WHERE NOT EXISTS (
        SELECT 1 FROM public.categories c 
        WHERE c.saas_client_id = sc.id AND c.name = 'Receitas Gerais' AND c.type = 'income'
    );
EXCEPTION
    WHEN others THEN
        NULL; -- Ignorar erros
END $$;

-- 5. Atualizar categoria nas contas existentes
UPDATE public.accounts_payable 
SET category_id = (
    SELECT id FROM public.categories 
    WHERE saas_client_id = accounts_payable.saas_client_id 
    AND type = 'expense' 
    AND name = 'Despesas Gerais'
    LIMIT 1
)
WHERE category_id IS NULL;

UPDATE public.accounts_receivable 
SET category_id = (
    SELECT id FROM public.categories 
    WHERE saas_client_id = accounts_receivable.saas_client_id 
    AND type = 'income' 
    AND name = 'Receitas Gerais'
    LIMIT 1
)
WHERE category_id IS NULL;
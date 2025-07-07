-- Migração final: recriar função e finalizar configuração

-- 1. Recriar função de migração
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
    )
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 2. Executar migração
SELECT migrate_financial_clients_to_clients();

-- 3. Criar índice único para document_number
CREATE UNIQUE INDEX IF NOT EXISTS clients_unique_document_per_client 
ON public.clients (saas_client_id, document_number) 
WHERE document_number IS NOT NULL AND TRIM(document_number) != '';

-- 4. Atualizar referências
UPDATE public.accounts_payable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

UPDATE public.accounts_receivable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

-- 5. Criar categorias padrão apenas se não existirem
DO $$
DECLARE
    client_rec RECORD;
BEGIN
    FOR client_rec IN SELECT id FROM public.saas_clients LOOP
        -- Categoria de despesas
        IF NOT EXISTS (SELECT 1 FROM public.categories WHERE saas_client_id = client_rec.id AND name = 'Despesas Gerais' AND type = 'expense') THEN
            INSERT INTO public.categories (saas_client_id, name, type, description) 
            VALUES (client_rec.id, 'Despesas Gerais', 'expense', 'Categoria padrão para despesas');
        END IF;
        
        -- Categoria de receitas
        IF NOT EXISTS (SELECT 1 FROM public.categories WHERE saas_client_id = client_rec.id AND name = 'Receitas Gerais' AND type = 'income') THEN
            INSERT INTO public.categories (saas_client_id, name, type, description) 
            VALUES (client_rec.id, 'Receitas Gerais', 'income', 'Categoria padrão para receitas');
        END IF;
    END LOOP;
END $$;

-- 6. Atualizar categoria nas contas existentes
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
-- Etapa 3: Migração de dados e configurações finais

-- 1. Criar função para migrar dados da financial_clients para clients
CREATE OR REPLACE FUNCTION migrate_financial_clients_to_clients()
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

-- 2. Executar migração dos dados
SELECT migrate_financial_clients_to_clients();

-- 3. Criar constraint única para document_number permitindo NULLs
CREATE UNIQUE INDEX IF NOT EXISTS clients_unique_document_per_client 
ON public.clients (saas_client_id, document_number) 
WHERE document_number IS NOT NULL AND TRIM(document_number) != '';

-- 4. Atualizar referências nas tabelas de contas
UPDATE public.accounts_payable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

UPDATE public.accounts_receivable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

-- 5. Criar categorias padrão para todos os clientes existentes
INSERT INTO public.categories (saas_client_id, name, type, description) 
SELECT DISTINCT 
    sc.id,
    'Despesas Gerais',
    'expense',
    'Categoria padrão para despesas'
FROM public.saas_clients sc
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories c 
    WHERE c.saas_client_id = sc.id AND c.name = 'Despesas Gerais' AND c.type = 'expense'
);

INSERT INTO public.categories (saas_client_id, name, type, description) 
SELECT DISTINCT 
    sc.id,
    'Receitas Gerais',
    'income',
    'Categoria padrão para receitas'
FROM public.saas_clients sc
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories c 
    WHERE c.saas_client_id = sc.id AND c.name = 'Receitas Gerais' AND c.type = 'income'
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

-- 6. Criar triggers para atualizar updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_services_updated_at BEFORE UPDATE ON public.products_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Atualizar referências de categoria nas contas existentes usando categorias padrão
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

-- 8. Comentários para documentação
COMMENT ON TABLE public.categories IS 'Categorias para produtos, serviços e lançamentos financeiros';
COMMENT ON TABLE public.departments IS 'Departamentos da empresa';
COMMENT ON TABLE public.positions IS 'Cargos/posições dos funcionários';
COMMENT ON TABLE public.employees IS 'Funcionários da empresa';
COMMENT ON TABLE public.clients IS 'Clientes e fornecedores unificados';
COMMENT ON TABLE public.products_services IS 'Produtos e serviços oferecidos';
COMMENT ON TABLE public.reports IS 'Relatórios gerados pelo sistema';
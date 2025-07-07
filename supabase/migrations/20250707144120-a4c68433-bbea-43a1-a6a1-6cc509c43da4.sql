-- Remover trigger e dependências com CASCADE

-- 1. Remover função e triggers com CASCADE
DROP FUNCTION IF EXISTS public.create_financial_transaction() CASCADE;

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

-- 5. Criar categorias padrão
DO $$
BEGIN
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
        NULL;
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

-- 7. Recriar função corrigida para transações financeiras
CREATE OR REPLACE FUNCTION public.create_financial_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Para contas a receber que foram pagas
  IF TG_TABLE_NAME = 'accounts_receivable' AND NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    INSERT INTO public.financial_transactions (
      saas_client_id,
      bank_account_id,
      type,
      amount,
      description,
      category,
      transaction_date,
      reference_type,
      reference_id
    ) VALUES (
      NEW.saas_client_id,
      NEW.bank_account_id,
      'income',
      NEW.amount,
      NEW.description,
      NEW.category,
      COALESCE(NEW.received_date, CURRENT_DATE),
      'account_receivable',
      NEW.id
    );
  END IF;

  -- Para contas a pagar que foram pagas
  IF TG_TABLE_NAME = 'accounts_payable' AND NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    INSERT INTO public.financial_transactions (
      saas_client_id,
      type,
      amount,
      description,
      category,
      transaction_date,
      reference_type,
      reference_id
    ) VALUES (
      NEW.saas_client_id,
      'expense',
      NEW.amount,
      NEW.description,
      NEW.category,
      COALESCE(NEW.paid_date, CURRENT_DATE),
      'account_payable',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- 8. Recriar triggers
CREATE TRIGGER trigger_accounts_receivable_transaction
    AFTER UPDATE ON public.accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION create_financial_transaction();

CREATE TRIGGER trigger_accounts_payable_transaction
    AFTER UPDATE ON public.accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION create_financial_transaction();
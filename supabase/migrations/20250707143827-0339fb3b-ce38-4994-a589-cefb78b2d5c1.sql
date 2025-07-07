-- Corrigir definitivamente o problema do trigger

-- 1. Primeiro, vamos desabilitar temporariamente os triggers
ALTER TABLE public.accounts_payable DISABLE TRIGGER update_financial_transaction_on_accounts_payable;
ALTER TABLE public.accounts_receivable DISABLE TRIGGER update_financial_transaction_on_accounts_receivable;

-- 2. Agora executar as operações de migração sem o trigger interferindo
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

SELECT migrate_financial_clients_to_clients();

-- 3. Atualizar referências
UPDATE public.accounts_payable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

UPDATE public.accounts_receivable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

-- 4. Criar categorias padrão
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

-- 6. Corrigir a função do trigger para usar os enums corretos
CREATE OR REPLACE FUNCTION public.create_financial_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Para contas a receber que foram recebidas (usar 'paid' ao invés de 'received')
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

-- 7. Reabilitar os triggers
ALTER TABLE public.accounts_payable ENABLE TRIGGER update_financial_transaction_on_accounts_payable;
ALTER TABLE public.accounts_receivable ENABLE TRIGGER update_financial_transaction_on_accounts_receivable;
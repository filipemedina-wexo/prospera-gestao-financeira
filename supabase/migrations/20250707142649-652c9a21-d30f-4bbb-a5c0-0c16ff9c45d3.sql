-- Corrigir trigger create_financial_transaction para usar os status corretos

-- 1. Primeiro, remover os triggers existentes temporariamente
DROP TRIGGER IF EXISTS update_financial_transaction_on_accounts_payable ON public.accounts_payable;
DROP TRIGGER IF EXISTS update_financial_transaction_on_accounts_receivable ON public.accounts_receivable;

-- 2. Atualizar a função para usar os status corretos dos enums
CREATE OR REPLACE FUNCTION public.create_financial_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Para contas a receber que foram recebidas
  IF TG_TABLE_NAME = 'accounts_receivable' AND NEW.status = 'received' AND (OLD IS NULL OR OLD.status != 'received') THEN
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

-- 3. Recriar os triggers
CREATE TRIGGER update_financial_transaction_on_accounts_payable
    AFTER UPDATE ON public.accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION create_financial_transaction();

CREATE TRIGGER update_financial_transaction_on_accounts_receivable
    AFTER UPDATE ON public.accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION create_financial_transaction();

-- 4. Executar as operações finais da migração anterior
SELECT migrate_financial_clients_to_clients();

UPDATE public.accounts_payable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

UPDATE public.accounts_receivable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

-- 5. Criar categorias padrão
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

-- 6. Atualizar referências de categoria
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
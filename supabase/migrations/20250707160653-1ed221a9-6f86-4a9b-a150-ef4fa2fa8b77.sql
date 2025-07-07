-- Fix: Correct enum values - remove 'paid' from accounts_receivable check
-- Remove existing problematic triggers first
DROP TRIGGER IF EXISTS trigger_accounts_receivable_transaction ON public.accounts_receivable;
DROP TRIGGER IF EXISTS trigger_accounts_payable_transaction ON public.accounts_payable;

-- Fix: Update RPC function to handle proper status mapping
CREATE OR REPLACE FUNCTION public.registrar_recebimento(
    p_receivable_id uuid, 
    p_received_date date, 
    p_bank_account_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_amount DECIMAL;
    v_saas_client_id UUID;
BEGIN
    -- Update the account receivable with proper status mapping
    UPDATE public.accounts_receivable
    SET 
        status = 'received',  -- Use correct enum value
        received_date = p_received_date,
        bank_account_id = p_bank_account_id,
        updated_at = now()
    WHERE id = p_receivable_id
    RETURNING amount, saas_client_id INTO v_amount, v_saas_client_id;

    IF v_amount IS NULL THEN
        RAISE EXCEPTION 'Conta a receber não encontrada ou acesso negado.';
    END IF;

    -- Update bank account balance
    UPDATE public.bank_accounts
    SET 
        balance = balance + v_amount,
        updated_at = now()
    WHERE id = p_bank_account_id AND saas_client_id = v_saas_client_id;

    -- Create financial transaction record
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
    ) 
    SELECT 
        ar.saas_client_id,
        p_bank_account_id,
        'income',
        ar.amount,
        ar.description,
        ar.category,
        p_received_date,
        'account_receivable',
        ar.id
    FROM public.accounts_receivable ar 
    WHERE ar.id = p_receivable_id;

END;
$function$;

-- Fix: Update financial transaction triggers to use correct status values
CREATE OR REPLACE FUNCTION public.create_financial_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- For accounts receivable that were marked as received
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

  -- For accounts payable that were marked as paid
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

-- Recreate triggers with proper names
CREATE TRIGGER trigger_accounts_receivable_transaction
    AFTER UPDATE ON public.accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION create_financial_transaction();

CREATE TRIGGER trigger_accounts_payable_transaction
    AFTER UPDATE ON public.accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION create_financial_transaction();

-- Fix: Ensure all existing data has correct status values (corrected enum values)
-- Update any invalid statuses in accounts_receivable (removed 'paid')
UPDATE public.accounts_receivable 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'received', 'overdue', 'partial');

-- Update any invalid statuses in accounts_payable  
UPDATE public.accounts_payable 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'paid', 'overdue', 'partial');

-- Ensure category mappings exist for all accounts
UPDATE public.accounts_payable 
SET category_id = (
    SELECT id FROM public.categories 
    WHERE saas_client_id = accounts_payable.saas_client_id 
    AND type = 'expense' 
    AND name = 'Despesas Gerais'
    LIMIT 1
)
WHERE category_id IS NULL AND category IS NOT NULL;

UPDATE public.accounts_receivable 
SET category_id = (
    SELECT id FROM public.categories 
    WHERE saas_client_id = accounts_receivable.saas_client_id 
    AND type = 'income' 
    AND name = 'Receitas Gerais'
    LIMIT 1
)
WHERE category_id IS NULL AND category IS NOT NULL;
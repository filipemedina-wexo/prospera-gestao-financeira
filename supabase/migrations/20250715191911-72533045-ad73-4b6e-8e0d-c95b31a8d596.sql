-- Update the create_financial_transaction function to handle enum differences correctly
CREATE OR REPLACE FUNCTION public.create_financial_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Allow operations when no user is authenticated (e.g., during migrations)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- For accounts receivable that were marked as received (NOT paid)
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
    
    RAISE NOTICE 'Created financial transaction for receivable % with status %', NEW.id, NEW.status;
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
    
    RAISE NOTICE 'Created financial transaction for payable % with status %', NEW.id, NEW.status;
  END IF;

  RETURN NEW;
END;
$function$;

-- Now clear the financial_client_id column
UPDATE accounts_payable 
SET financial_client_id = NULL;
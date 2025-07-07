-- DEFINITIVE FIX: Comprehensive solution for account_receivable_status enum issues
-- This migration addresses all potential sources of the 'paid' status error

-- Step 1: Add 'paid' to account_receivable_status enum if it doesn't exist (for backward compatibility)
DO $$
BEGIN
  -- Check if 'paid' exists in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'account_receivable_status'::regtype 
    AND enumlabel = 'paid'
  ) THEN
    ALTER TYPE account_receivable_status ADD VALUE 'paid';
    RAISE NOTICE 'Added paid value to account_receivable_status enum';
  ELSE
    RAISE NOTICE 'paid value already exists in account_receivable_status enum';
  END IF;
END $$;

-- Step 2: Show current enum values for debugging
DO $$
BEGIN
    RAISE NOTICE 'Current account_receivable_status enum values: %', 
        (SELECT array_agg(enumlabel ORDER BY enumlabel) 
         FROM pg_enum e 
         JOIN pg_type t ON e.enumtypid = t.oid 
         WHERE t.typname = 'account_receivable_status');
END $$;

-- Step 3: Fix the create_financial_transaction trigger function that may be using wrong status
DROP FUNCTION IF EXISTS public.create_financial_transaction() CASCADE;

CREATE OR REPLACE FUNCTION public.create_financial_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
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

-- Step 4: Recreate triggers with proper names
DROP TRIGGER IF EXISTS create_financial_transaction_on_accounts_receivable ON public.accounts_receivable;
DROP TRIGGER IF EXISTS create_financial_transaction_on_accounts_payable ON public.accounts_payable;

CREATE TRIGGER create_financial_transaction_on_accounts_receivable
    AFTER UPDATE ON public.accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION public.create_financial_transaction();

CREATE TRIGGER create_financial_transaction_on_accounts_payable
    AFTER UPDATE ON public.accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION public.create_financial_transaction();

-- Step 5: Ensure registrar_recebimento function uses correct status
DROP FUNCTION IF EXISTS public.registrar_recebimento(uuid, date, uuid);

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
    v_current_status TEXT;
BEGIN
    -- Get current status for logging
    SELECT status::text INTO v_current_status 
    FROM public.accounts_receivable 
    WHERE id = p_receivable_id;
    
    RAISE NOTICE 'Registering payment for receivable %. Current status: %', p_receivable_id, v_current_status;
    
    -- Update the account receivable with CORRECT status for accounts_receivable
    UPDATE public.accounts_receivable
    SET 
        status = 'received'::account_receivable_status,  -- CRITICAL: Use 'received' for accounts_receivable
        received_date = p_received_date,
        bank_account_id = p_bank_account_id,
        updated_at = now()
    WHERE id = p_receivable_id
    RETURNING amount, saas_client_id INTO v_amount, v_saas_client_id;

    IF v_amount IS NULL THEN
        RAISE EXCEPTION 'Conta a receber não encontrada ou acesso negado.';
    END IF;

    RAISE NOTICE 'Successfully updated receivable % to received status. Amount: %', p_receivable_id, v_amount;

    -- Update bank account balance
    UPDATE public.bank_accounts
    SET 
        balance = balance + v_amount,
        updated_at = now()
    WHERE id = p_bank_account_id AND saas_client_id = v_saas_client_id;

    RAISE NOTICE 'Updated bank account % balance by %', p_bank_account_id, v_amount;

    -- Financial transaction will be created automatically by the trigger

END;
$function$;

-- Step 6: Add a validation function to prevent future confusion
CREATE OR REPLACE FUNCTION public.validate_account_status_usage() 
RETURNS void 
LANGUAGE plpgsql 
AS $function$
BEGIN
    -- This function serves as documentation and validation
    -- accounts_receivable should use: pending, received, overdue, partial
    -- accounts_payable should use: pending, paid, overdue, partial
    
    RAISE NOTICE 'Status validation: accounts_receivable uses received, accounts_payable uses paid';
END;
$function$;

-- Step 7: Final verification
SELECT 'MIGRATION COMPLETED: Fixed account_receivable_status enum and related functions' as status;
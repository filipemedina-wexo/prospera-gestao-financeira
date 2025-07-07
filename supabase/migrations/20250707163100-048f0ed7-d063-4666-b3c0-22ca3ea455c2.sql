-- COMPREHENSIVE FIX: Remove all registrar_recebimento function versions and recreate correctly

-- Step 1: Drop ALL possible versions of the function with different signatures
DROP FUNCTION IF EXISTS public.registrar_recebimento(uuid, date, uuid);
DROP FUNCTION IF EXISTS public.registrar_recebimento(uuid, uuid, date);
DROP FUNCTION IF EXISTS public.registrar_recebimento(p_receivable_id uuid, p_received_date date, p_bank_account_id uuid);
DROP FUNCTION IF EXISTS public.registrar_recebimento(p_receivable_id uuid, p_bank_account_id uuid, p_received_date date);

-- Step 2: Verify enum values exist (this will show what values are actually valid)
DO $$
BEGIN
    RAISE NOTICE 'Valid account_receivable_status enum values: %', 
        (SELECT array_agg(enumlabel ORDER BY enumlabel) 
         FROM pg_enum e 
         JOIN pg_type t ON e.enumtypid = t.oid 
         WHERE t.typname = 'account_receivable_status');
END $$;

-- Step 3: Create the function with ONLY correct status values
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
    -- First, check current status to debug
    SELECT status::text INTO v_current_status 
    FROM public.accounts_receivable 
    WHERE id = p_receivable_id;
    
    RAISE NOTICE 'Current status before update: %', v_current_status;
    
    -- Update the account receivable with CORRECT status for accounts_receivable
    UPDATE public.accounts_receivable
    SET 
        status = 'received'::account_receivable_status,  -- Explicitly cast to correct enum
        received_date = p_received_date,
        bank_account_id = p_bank_account_id,
        updated_at = now()
    WHERE id = p_receivable_id
    RETURNING amount, saas_client_id INTO v_amount, v_saas_client_id;

    IF v_amount IS NULL THEN
        RAISE EXCEPTION 'Conta a receber não encontrada ou acesso negado.';
    END IF;

    RAISE NOTICE 'Successfully updated to received status for amount: %', v_amount;

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

    RAISE NOTICE 'Financial transaction created successfully';

END;
$function$;

-- Step 4: Test the function exists and has correct signature
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as result_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'registrar_recebimento';

COMMENT ON FUNCTION public.registrar_recebimento(uuid, date, uuid) IS 'Fixed function that correctly uses received status for accounts_receivable';
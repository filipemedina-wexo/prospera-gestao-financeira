-- Fix: Remove duplicate registrar_recebimento function and keep only the correct version
-- Drop all versions of the function first
DROP FUNCTION IF EXISTS public.registrar_recebimento(uuid, uuid, date);
DROP FUNCTION IF EXISTS public.registrar_recebimento(uuid, date, uuid);

-- Recreate the function with the correct signature and implementation
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
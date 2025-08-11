-- Add bank_account_id to accounts_payable table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.accounts_payable'::regclass AND attname = 'bank_account_id' AND NOT attisdropped) THEN
        ALTER TABLE public.accounts_payable ADD COLUMN bank_account_id UUID REFERENCES public.bank_accounts(id);
    END IF;
END;
$$;

-- Create or replace function to register a payment
CREATE OR REPLACE FUNCTION public.registrar_pagamento(
    p_payable_id UUID,
    p_bank_account_id UUID,
    p_paid_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_amount DECIMAL;
BEGIN
    -- Update the accounts_payable table and get the amount
    UPDATE public.accounts_payable
    SET
        status = 'paid'::account_payable_status,
        paid_date = p_paid_date,
        bank_account_id = p_bank_account_id
    WHERE id = p_payable_id
    RETURNING amount INTO v_amount;

    IF v_amount IS NULL THEN
        RAISE EXCEPTION 'Conta a pagar não encontrada ou acesso negado.';
    END IF;

    -- Update the bank account balance
    UPDATE public.bank_accounts
    SET balance = balance - v_amount
    WHERE id = p_bank_account_id;

END;
$$;

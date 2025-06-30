-- Renomeia a coluna para refletir o saldo atual, não apenas o inicial
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.bank_accounts'::regclass AND attname = 'initial_balance' AND NOT attisdropped) THEN
        ALTER TABLE public.bank_accounts RENAME COLUMN initial_balance TO balance;
    END IF;
END;
$$;

-- Cria a função para registrar o recebimento de forma segura (transacional)
CREATE OR REPLACE FUNCTION public.registrar_recebimento(
    p_receivable_id UUID,
    p_bank_account_id UUID,
    p_received_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_amount DECIMAL;
BEGIN
    -- Atualiza a conta a receber e obtém o valor
    UPDATE public.accounts_receivable
    SET
        status = 'received'::account_receivable_status,
        received_date = p_received_date,
        bank_account_id = p_bank_account_id
    WHERE id = p_receivable_id
    RETURNING amount INTO v_amount;

    IF v_amount IS NULL THEN
        RAISE EXCEPTION 'Conta a receber não encontrada ou acesso negado.';
    END IF;

    -- Atualiza o saldo da conta bancária
    UPDATE public.bank_accounts
    SET balance = balance + v_amount
    WHERE id = p_bank_account_id;

END;
$$;
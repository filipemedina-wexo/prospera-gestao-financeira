-- Adiciona a coluna 'competencia' se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.accounts_receivable'::regclass AND attname = 'competencia' AND NOT attisdropped) THEN
        ALTER TABLE public.accounts_receivable ADD COLUMN competencia TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.accounts_payable'::regclass AND attname = 'competencia' AND NOT attisdropped) THEN
        ALTER TABLE public.accounts_payable ADD COLUMN competencia TEXT;
    END IF;
END;
$$;

-- Cria a tabela de contas bancárias se ela não existir
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bank_name TEXT,
    agency TEXT,
    account_number TEXT,
    type TEXT CHECK (type IN ('corrente', 'poupanca', 'investimento')),
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Renomeia a coluna 'initial_balance' para 'balance' se ela existir
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.bank_accounts'::regclass AND attname = 'initial_balance' AND NOT attisdropped) THEN
        ALTER TABLE public.bank_accounts RENAME COLUMN initial_balance TO balance;
    END IF;
END;
$$;

-- Adiciona a coluna para vincular o recebimento à conta bancária se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.accounts_receivable'::regclass AND attname = 'bank_account_id' AND NOT attisdropped) THEN
        ALTER TABLE public.accounts_receivable ADD COLUMN bank_account_id UUID REFERENCES public.bank_accounts(id);
    END IF;
END;
$$;

-- Cria ou substitui a função para registrar o recebimento
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
        status = 'received',
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
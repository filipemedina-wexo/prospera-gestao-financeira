-- BE-01: Funções para baixa de contas a pagar e receber com movimentação de caixa

CREATE OR REPLACE FUNCTION public.pay_payable(
    p_payable_id uuid,
    p_account_id uuid,
    p_paid_at timestamptz DEFAULT now()
)
RETURNS accounts_payable
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_payable accounts_payable%ROWTYPE;
    v_exists boolean;
BEGIN
    -- Carrega a conta a pagar e bloqueia para atualização
    SELECT * INTO v_payable FROM accounts_payable WHERE id = p_payable_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conta a pagar não encontrada';
    END IF;

    -- Verifica se já existe movimento de caixa para garantir idempotência
    SELECT EXISTS(
        SELECT 1 FROM cash_transactions WHERE origin_type = 'payable' AND origin_id = p_payable_id
    ) INTO v_exists;

    IF v_exists THEN
        RETURN v_payable; -- já baixado, retorna o registro atual
    END IF;

    -- Valida status atual
    IF v_payable.status NOT IN ('pending','overdue') THEN
        RAISE EXCEPTION 'Status inválido %', v_payable.status;
    END IF;

    -- Cria movimento de caixa
    INSERT INTO cash_transactions (
        company_id, account_id, direction, amount_dec, occurred_at, origin_type, origin_id
    ) VALUES (
        v_payable.saas_client_id,
        p_account_id,
        'out',
        v_payable.amount,
        COALESCE(p_paid_at, now()),
        'payable',
        p_payable_id
    ) ON CONFLICT (origin_type, origin_id) DO NOTHING;

    -- Atualiza status da conta
    UPDATE accounts_payable
    SET status = 'paid',
        paid_date = COALESCE(p_paid_at, now())::date,
        updated_at = now()
    WHERE id = p_payable_id
    RETURNING * INTO v_payable;

    RETURN v_payable;
END;
$$;

CREATE OR REPLACE FUNCTION public.receive_receivable(
    p_receivable_id uuid,
    p_account_id uuid,
    p_received_at timestamptz DEFAULT now()
)
RETURNS accounts_receivable
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_receivable accounts_receivable%ROWTYPE;
    v_exists boolean;
BEGIN
    -- Carrega a conta a receber e bloqueia para atualização
    SELECT * INTO v_receivable FROM accounts_receivable WHERE id = p_receivable_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conta a receber não encontrada';
    END IF;

    -- Verifica se já existe movimento de caixa para garantir idempotência
    SELECT EXISTS(
        SELECT 1 FROM cash_transactions WHERE origin_type = 'receivable' AND origin_id = p_receivable_id
    ) INTO v_exists;

    IF v_exists THEN
        RETURN v_receivable; -- já recebido, retorna o registro atual
    END IF;

    -- Valida status atual
    IF v_receivable.status NOT IN ('pending','overdue') THEN
        RAISE EXCEPTION 'Status inválido %', v_receivable.status;
    END IF;

    -- Cria movimento de caixa
    INSERT INTO cash_transactions (
        company_id, account_id, direction, amount_dec, occurred_at, origin_type, origin_id
    ) VALUES (
        v_receivable.saas_client_id,
        p_account_id,
        'in',
        v_receivable.amount,
        COALESCE(p_received_at, now()),
        'receivable',
        p_receivable_id
    ) ON CONFLICT (origin_type, origin_id) DO NOTHING;

    -- Atualiza status da conta
    UPDATE accounts_receivable
    SET status = 'received',
        received_date = COALESCE(p_received_at, now())::date,
        updated_at = now()
    WHERE id = p_receivable_id
    RETURNING * INTO v_receivable;

    RETURN v_receivable;
END;
$$;


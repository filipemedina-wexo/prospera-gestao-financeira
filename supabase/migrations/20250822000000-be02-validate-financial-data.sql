-- BE-02: Validations for supplier/category/amount and status state machine

-- Drop old status validation triggers/function
DROP TRIGGER IF EXISTS validate_account_status_trigger ON accounts_payable;
DROP TRIGGER IF EXISTS validate_account_status_trigger ON accounts_receivable;
DROP FUNCTION IF EXISTS public.validate_account_status();

-- Update financial data integrity validation
CREATE OR REPLACE FUNCTION public.validate_financial_data_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure client mapping
    IF NEW.saas_client_id IS NULL THEN
        RAISE EXCEPTION 'saas_client_id cannot be null';
    END IF;
    IF NOT (is_super_admin() OR user_belongs_to_client(NEW.saas_client_id)) THEN
        RAISE EXCEPTION 'User does not belong to the specified client';
    END IF;

    -- Amount must be positive
    IF NEW.amount <= 0 THEN
        RAISE EXCEPTION 'amount_dec must be positive';
    END IF;

    -- Table specific validations
    IF TG_TABLE_NAME = 'accounts_payable' THEN
        IF NEW.client_id IS NULL THEN
            RAISE EXCEPTION 'supplier_id required';
        END IF;
        IF NEW.category_id IS NULL THEN
            RAISE EXCEPTION 'category_id required';
        END IF;
    ELSIF TG_TABLE_NAME = 'accounts_receivable' THEN
        IF NEW.category_id IS NULL THEN
            RAISE EXCEPTION 'category_id required';
        END IF;
    END IF;

    -- Date sanity check
    IF TG_TABLE_NAME = 'accounts_payable' AND NEW.due_date < CURRENT_DATE - INTERVAL '5 years' THEN
        RAISE EXCEPTION 'Due date cannot be more than 5 years in the past';
    END IF;
    IF TG_TABLE_NAME = 'accounts_receivable' AND NEW.due_date < CURRENT_DATE - INTERVAL '5 years' THEN
        RAISE EXCEPTION 'Due date cannot be more than 5 years in the past';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enforce state machine for status transitions
CREATE OR REPLACE FUNCTION public.enforce_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'accounts_payable' THEN
        IF OLD.status IN ('paid', 'canceled') THEN
            RAISE EXCEPTION 'already settled';
        END IF;
        IF OLD.status IN ('pending', 'overdue') AND NEW.status NOT IN ('pending', 'overdue', 'paid', 'canceled') THEN
            RAISE EXCEPTION 'invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
        IF OLD.status IN ('pending', 'overdue') AND NEW.status IN ('pending', 'overdue') THEN
            RETURN NEW;
        END IF;
        -- Allow transitions to paid/canceled
        RETURN NEW;
    ELSIF TG_TABLE_NAME = 'accounts_receivable' THEN
        IF OLD.status IN ('received', 'canceled') THEN
            RAISE EXCEPTION 'already settled';
        END IF;
        IF OLD.status IN ('pending', 'overdue') AND NEW.status NOT IN ('pending', 'overdue', 'received', 'canceled') THEN
            RAISE EXCEPTION 'invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
        IF OLD.status IN ('pending', 'overdue') AND NEW.status IN ('pending', 'overdue') THEN
            RETURN NEW;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_status_transition ON accounts_payable;
CREATE TRIGGER enforce_status_transition
    BEFORE UPDATE ON accounts_payable
    FOR EACH ROW EXECUTE FUNCTION public.enforce_status_transition();

DROP TRIGGER IF EXISTS enforce_status_transition ON accounts_receivable;
CREATE TRIGGER enforce_status_transition
    BEFORE UPDATE ON accounts_receivable
    FOR EACH ROW EXECUTE FUNCTION public.enforce_status_transition();

-- Improve pay/receive functions to respect state machine
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
    SELECT * INTO v_payable FROM accounts_payable WHERE id = p_payable_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conta a pagar não encontrada';
    END IF;

    SELECT EXISTS(
        SELECT 1 FROM cash_transactions WHERE origin_type = 'payable' AND origin_id = p_payable_id
    ) INTO v_exists;

    IF v_exists OR v_payable.status NOT IN ('pending','overdue') THEN
        RAISE EXCEPTION 'already settled';
    END IF;

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
    );

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
    SELECT * INTO v_receivable FROM accounts_receivable WHERE id = p_receivable_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conta a receber não encontrada';
    END IF;

    SELECT EXISTS(
        SELECT 1 FROM cash_transactions WHERE origin_type = 'receivable' AND origin_id = p_receivable_id
    ) INTO v_exists;

    IF v_exists OR v_receivable.status NOT IN ('pending','overdue') THEN
        RAISE EXCEPTION 'already settled';
    END IF;

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
    );

    UPDATE accounts_receivable
    SET status = 'received',
        received_date = COALESCE(p_received_at, now())::date,
        updated_at = now()
    WHERE id = p_receivable_id
    RETURNING * INTO v_receivable;

    RETURN v_receivable;
END;
$$;


-- Enforce required fields and status state machine for payables and receivables

-- 1. Ensure enums include canceled status
ALTER TYPE account_payable_status ADD VALUE IF NOT EXISTS 'canceled';
ALTER TYPE account_receivable_status ADD VALUE IF NOT EXISTS 'canceled';

-- 2. Update financial data integrity validation
CREATE OR REPLACE FUNCTION public.validate_financial_data_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate that saas_client_id is properly set
    IF NEW.saas_client_id IS NULL THEN
        RAISE EXCEPTION 'saas_client_id cannot be null';
    END IF;

    -- Validate that user belongs to the client
    IF NOT (is_super_admin() OR user_belongs_to_client(NEW.saas_client_id)) THEN
        RAISE EXCEPTION 'User does not belong to the specified client';
    END IF;

    -- Validate amount is positive
    IF NEW.amount <= 0 THEN
        RAISE EXCEPTION 'amount must be greater than 0';
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

    -- Validate dates
    IF TG_TABLE_NAME = 'accounts_payable' AND NEW.due_date < CURRENT_DATE - INTERVAL '5 years' THEN
        RAISE EXCEPTION 'Due date cannot be more than 5 years in the past';
    END IF;
    IF TG_TABLE_NAME = 'accounts_receivable' AND NEW.due_date < CURRENT_DATE - INTERVAL '5 years' THEN
        RAISE EXCEPTION 'Due date cannot be more than 5 years in the past';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enforce status transitions
CREATE OR REPLACE FUNCTION public.enforce_account_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'accounts_payable' THEN
        IF OLD.status IN ('paid','canceled') THEN
            RAISE EXCEPTION 'already settled';
        END IF;
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            IF NOT (OLD.status IN ('pending','overdue') AND NEW.status IN ('paid','canceled')) THEN
                RAISE EXCEPTION 'invalid status transition';
            END IF;
        END IF;
    ELSIF TG_TABLE_NAME = 'accounts_receivable' THEN
        IF OLD.status IN ('received','canceled') THEN
            RAISE EXCEPTION 'already settled';
        END IF;
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            IF NOT (OLD.status IN ('pending','overdue') AND NEW.status IN ('received','canceled')) THEN
                RAISE EXCEPTION 'invalid status transition';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for status transition enforcement
DROP TRIGGER IF EXISTS enforce_status_transition_payable ON accounts_payable;
CREATE TRIGGER enforce_status_transition_payable
    BEFORE UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_account_status_transition();

DROP TRIGGER IF EXISTS enforce_status_transition_receivable ON accounts_receivable;
CREATE TRIGGER enforce_status_transition_receivable
    BEFORE UPDATE ON accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_account_status_transition();

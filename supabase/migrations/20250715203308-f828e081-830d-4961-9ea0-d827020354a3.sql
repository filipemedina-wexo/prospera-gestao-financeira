-- Fix: Ensure correct status mapping for accounts_payable vs accounts_receivable
-- Add validation to prevent wrong status being applied

-- Create function to validate account status before updates
CREATE OR REPLACE FUNCTION validate_account_status() 
RETURNS TRIGGER AS $$
BEGIN
    -- For accounts_payable, only allow: pending, paid, overdue, partial
    IF TG_TABLE_NAME = 'accounts_payable' THEN
        IF NEW.status NOT IN ('pending', 'paid', 'overdue', 'partial') THEN
            RAISE EXCEPTION 'Invalid status "%" for accounts_payable. Valid statuses are: pending, paid, overdue, partial', NEW.status;
        END IF;
    END IF;
    
    -- For accounts_receivable, only allow: pending, received, overdue, partial, paid
    IF TG_TABLE_NAME = 'accounts_receivable' THEN
        IF NEW.status NOT IN ('pending', 'received', 'overdue', 'partial', 'paid') THEN
            RAISE EXCEPTION 'Invalid status "%" for accounts_receivable. Valid statuses are: pending, received, overdue, partial, paid', NEW.status;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to validate status before insert/update
DROP TRIGGER IF EXISTS validate_accounts_payable_status ON accounts_payable;
CREATE TRIGGER validate_accounts_payable_status
    BEFORE INSERT OR UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION validate_account_status();

DROP TRIGGER IF EXISTS validate_accounts_receivable_status ON accounts_receivable;
CREATE TRIGGER validate_accounts_receivable_status
    BEFORE INSERT OR UPDATE ON accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION validate_account_status();

-- Update any existing records with invalid status (just in case)
UPDATE accounts_payable 
SET status = 'paid'::account_payable_status 
WHERE status::text = 'received';

-- Log the correction
INSERT INTO security_audit_log (
    action, 
    resource_type, 
    success, 
    metadata
) VALUES (
    'STATUS_VALIDATION_CORRECTION',
    'accounts_payable',
    true,
    '{"message": "Added validation triggers and corrected any invalid status values"}'::jsonb
);
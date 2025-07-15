-- Migrate data from financial_client_id to client_id in accounts_payable table
-- Temporarily disable the trigger to allow data migration

-- Disable the trigger temporarily
DROP TRIGGER IF EXISTS validate_financial_data_integrity_trigger ON accounts_payable;

-- Update accounts_payable records where financial_client_id is set but client_id is null
UPDATE accounts_payable 
SET client_id = financial_client_id 
WHERE financial_client_id IS NOT NULL AND client_id IS NULL;

-- Clear the financial_client_id column as it's no longer needed
UPDATE accounts_payable 
SET financial_client_id = NULL 
WHERE financial_client_id IS NOT NULL;

-- Re-enable the trigger
CREATE TRIGGER validate_financial_data_integrity_trigger
    BEFORE INSERT OR UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION validate_financial_data_integrity();
-- Simply clear the financial_client_id column since data is already correctly in client_id
-- This migration prepares accounts_payable to use only the client_id column

-- Clear the financial_client_id column safely
UPDATE accounts_payable 
SET financial_client_id = NULL;
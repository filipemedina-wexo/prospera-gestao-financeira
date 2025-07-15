-- Clear the financial_client_id column since data is already correctly in client_id
UPDATE accounts_payable 
SET financial_client_id = NULL;
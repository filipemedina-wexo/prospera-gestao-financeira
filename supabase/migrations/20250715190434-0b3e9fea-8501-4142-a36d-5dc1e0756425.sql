-- Migrate data from financial_client_id to client_id in accounts_payable table
-- This migration ensures accounts_payable uses the correct clients table relationship

-- Update accounts_payable records where financial_client_id is set but client_id is null
UPDATE accounts_payable 
SET client_id = financial_client_id 
WHERE financial_client_id IS NOT NULL AND client_id IS NULL;

-- Clear the financial_client_id column as it's no longer needed
UPDATE accounts_payable 
SET financial_client_id = NULL 
WHERE financial_client_id IS NOT NULL;
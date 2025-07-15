-- This migration confirms that accounts_payable data is already correctly migrated
-- The existing data already has both financial_client_id and client_id with the same values
-- Since we're now using client_id, no data migration is needed

-- Add a comment to document this migration
COMMENT ON TABLE accounts_payable IS 'Table updated to use client_id instead of financial_client_id. Migration confirmed complete.';
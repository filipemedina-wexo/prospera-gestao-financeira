
-- First, remove the default values temporarily
ALTER TABLE accounts_payable ALTER COLUMN status DROP DEFAULT;
ALTER TABLE accounts_receivable ALTER COLUMN status DROP DEFAULT;

-- Create enum types for account statuses
CREATE TYPE account_payable_status AS ENUM ('pending', 'paid', 'overdue', 'partial');
CREATE TYPE account_receivable_status AS ENUM ('pending', 'received', 'overdue', 'partial');

-- Update accounts_payable table to use the enum
ALTER TABLE accounts_payable 
ALTER COLUMN status TYPE account_payable_status 
USING status::account_payable_status;

-- Update accounts_receivable table to use the enum  
ALTER TABLE accounts_receivable 
ALTER COLUMN status TYPE account_receivable_status 
USING status::account_receivable_status;

-- Set the new default values using proper enum values
ALTER TABLE accounts_payable 
ALTER COLUMN status SET DEFAULT 'pending'::account_payable_status;

ALTER TABLE accounts_receivable 
ALTER COLUMN status SET DEFAULT 'pending'::account_receivable_status;

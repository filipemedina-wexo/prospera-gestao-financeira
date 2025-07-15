-- Step 1: Finalize Financial Security (RLS)
-- Create comprehensive RLS policies for accounts_payable and accounts_receivable tables

-- Drop existing overlapping policies if any
DROP POLICY IF EXISTS "Super admins can access all accounts payable" ON public.accounts_payable;
DROP POLICY IF EXISTS "Users can only access their client's accounts payable" ON public.accounts_payable;
DROP POLICY IF EXISTS "Users can create accounts payable for their client" ON public.accounts_payable;
DROP POLICY IF EXISTS "Users can update accounts payable for their client" ON public.accounts_payable;
DROP POLICY IF EXISTS "Users can delete accounts payable for their client" ON public.accounts_payable;
DROP POLICY IF EXISTS "Users can view accounts payable for their client" ON public.accounts_payable;

DROP POLICY IF EXISTS "Super admins can access all accounts receivable" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can only access their client's accounts receivable" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can create accounts receivable for their client" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can update accounts receivable for their client" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can delete accounts receivable for their client" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Users can view accounts receivable for their client" ON public.accounts_receivable;

-- Create unified RLS policies for accounts_payable
CREATE POLICY "accounts_payable_access_policy" ON public.accounts_payable
FOR ALL
USING (
    is_super_admin() OR 
    user_belongs_to_client(saas_client_id)
)
WITH CHECK (
    is_super_admin() OR 
    (saas_client_id = get_current_user_client_id())
);

-- Create unified RLS policies for accounts_receivable
CREATE POLICY "accounts_receivable_access_policy" ON public.accounts_receivable
FOR ALL
USING (
    is_super_admin() OR 
    user_belongs_to_client(saas_client_id)
)
WITH CHECK (
    is_super_admin() OR 
    (saas_client_id = get_current_user_client_id())
);

-- Log security policy creation
INSERT INTO public.security_audit_log (
    user_id, action, resource_type, success, metadata
) VALUES (
    auth.uid(),
    'RLS_POLICY_CREATED',
    'accounts_payable',
    true,
    jsonb_build_object(
        'policy_name', 'accounts_payable_access_policy',
        'created_at', now()
    )
);

INSERT INTO public.security_audit_log (
    user_id, action, resource_type, success, metadata
) VALUES (
    auth.uid(),
    'RLS_POLICY_CREATED',
    'accounts_receivable',
    true,
    jsonb_build_object(
        'policy_name', 'accounts_receivable_access_policy',
        'created_at', now()
    )
);

-- Create validation function for financial data integrity
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
    
    -- Validate amounts are positive
    IF NEW.amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
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

-- Create validation triggers
CREATE TRIGGER validate_accounts_payable_integrity
    BEFORE INSERT OR UPDATE ON public.accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_financial_data_integrity();

CREATE TRIGGER validate_accounts_receivable_integrity
    BEFORE INSERT OR UPDATE ON public.accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_financial_data_integrity();
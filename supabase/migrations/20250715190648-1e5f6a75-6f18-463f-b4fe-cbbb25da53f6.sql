-- Update the validation function to allow operations when no user is authenticated (migrations)
CREATE OR REPLACE FUNCTION public.validate_financial_data_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Allow operations when no user is authenticated (e.g., during migrations)
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;
    
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
$function$;
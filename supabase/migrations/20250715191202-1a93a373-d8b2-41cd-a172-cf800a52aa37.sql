-- Update the validate_saas_client_id function to allow operations when no user is authenticated
CREATE OR REPLACE FUNCTION public.validate_saas_client_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Allow operations when no user is authenticated (e.g., during migrations)
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Ensure saas_client_id is set and matches current user's client
    IF NEW.saas_client_id IS NULL THEN
        NEW.saas_client_id := get_current_user_client_id();
    END IF;
    
    -- Validate that user belongs to the client (unless super admin)
    IF NOT (is_super_admin() OR user_belongs_to_client(NEW.saas_client_id)) THEN
        RAISE EXCEPTION 'Access denied: Invalid client assignment';
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Now clear the financial_client_id column
UPDATE accounts_payable 
SET financial_client_id = NULL;
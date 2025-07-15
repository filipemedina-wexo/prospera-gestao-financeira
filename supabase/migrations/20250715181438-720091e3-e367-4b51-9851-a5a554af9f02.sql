-- Complete Multi-Tenant Security Policies (RLS)
-- This migration ensures complete Row Level Security for all business data tables

-- Enable RLS on all business tables that don't have it yet
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_account_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_databases ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for financial_transactions
DROP POLICY IF EXISTS "Users can view their client's financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can create their client's financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can update their client's financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can delete their client's financial transactions" ON public.financial_transactions;

CREATE POLICY "Users can view their client's financial transactions" ON public.financial_transactions
    FOR SELECT USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can create their client's financial transactions" ON public.financial_transactions
    FOR INSERT WITH CHECK (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can update their client's financial transactions" ON public.financial_transactions
    FOR UPDATE USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can delete their client's financial transactions" ON public.financial_transactions
    FOR DELETE USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

-- Add super admin policies for all tables
CREATE POLICY "Super admins can access all financial transactions" ON public.financial_transactions
    FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Fix client_account_categories policies
DROP POLICY IF EXISTS "Users can manage categories for their client" ON public.client_account_categories;
DROP POLICY IF EXISTS "Users can view categories for their client" ON public.client_account_categories;
DROP POLICY IF EXISTS "Users can create their client categories" ON public.client_account_categories;
DROP POLICY IF EXISTS "Users can update their client categories" ON public.client_account_categories;
DROP POLICY IF EXISTS "Users can delete their client categories" ON public.client_account_categories;
DROP POLICY IF EXISTS "Users can view their client categories" ON public.client_account_categories;

CREATE POLICY "Users can view client categories" ON public.client_account_categories
    FOR SELECT USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can create client categories" ON public.client_account_categories
    FOR INSERT WITH CHECK (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can update client categories" ON public.client_account_categories
    FOR UPDATE USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can delete client categories" ON public.client_account_categories
    FOR DELETE USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

-- Ensure all tables have proper saas_client_id constraints
-- Add NOT NULL constraint to saas_client_id columns where missing
ALTER TABLE public.accounts_payable ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.accounts_receivable ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.financial_transactions ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.bank_accounts ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.categories ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.client_account_categories ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.clients ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.departments ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.employees ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.financial_clients ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.positions ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.products_services ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.proposals ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.reports ALTER COLUMN saas_client_id SET NOT NULL;
ALTER TABLE public.sellers ALTER COLUMN saas_client_id SET NOT NULL;

-- Create audit trigger for critical security events
CREATE OR REPLACE FUNCTION public.audit_rls_bypass()
RETURNS TRIGGER AS $$
BEGIN
    -- Log any attempt to bypass RLS
    INSERT INTO public.security_audit_log (
        user_id, action, resource_type, resource_id, success, metadata
    ) VALUES (
        auth.uid(),
        'RLS_BYPASS_ATTEMPT',
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        false,
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'timestamp', now()
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add validation to ensure saas_client_id is always set correctly
CREATE OR REPLACE FUNCTION public.validate_saas_client_id()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply validation trigger to all business tables
CREATE TRIGGER validate_saas_client_id_trigger
    BEFORE INSERT OR UPDATE ON public.accounts_payable
    FOR EACH ROW EXECUTE FUNCTION public.validate_saas_client_id();

CREATE TRIGGER validate_saas_client_id_trigger
    BEFORE INSERT OR UPDATE ON public.accounts_receivable
    FOR EACH ROW EXECUTE FUNCTION public.validate_saas_client_id();

CREATE TRIGGER validate_saas_client_id_trigger
    BEFORE INSERT OR UPDATE ON public.financial_transactions
    FOR EACH ROW EXECUTE FUNCTION public.validate_saas_client_id();

CREATE TRIGGER validate_saas_client_id_trigger
    BEFORE INSERT OR UPDATE ON public.bank_accounts
    FOR EACH ROW EXECUTE FUNCTION public.validate_saas_client_id();

CREATE TRIGGER validate_saas_client_id_trigger
    BEFORE INSERT OR UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.validate_saas_client_id();

CREATE TRIGGER validate_saas_client_id_trigger
    BEFORE INSERT OR UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.validate_saas_client_id();

CREATE TRIGGER validate_saas_client_id_trigger
    BEFORE INSERT OR UPDATE ON public.products_services
    FOR EACH ROW EXECUTE FUNCTION public.validate_saas_client_id();

CREATE TRIGGER validate_saas_client_id_trigger
    BEFORE INSERT OR UPDATE ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION public.validate_saas_client_id();

-- Log successful RLS implementation
INSERT INTO public.security_audit_log (
    user_id, action, resource_type, success, metadata
) VALUES (
    auth.uid(),
    'RLS_COMPLETE_IMPLEMENTATION',
    'system',
    true,
    jsonb_build_object(
        'timestamp', now(),
        'tables_secured', array[
            'financial_transactions',
            'client_account_categories', 
            'accounts_payable',
            'accounts_receivable',
            'bank_accounts',
            'categories',
            'clients',
            'products_services',
            'proposals'
        ]
    )
);
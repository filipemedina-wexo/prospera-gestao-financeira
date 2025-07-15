-- Financial Transaction Consistency Triggers
-- This migration ensures financial_transactions table is always synchronized with accounts_payable and accounts_receivable

-- Create function to handle financial transaction updates when account status changes
CREATE OR REPLACE FUNCTION public.sync_financial_transaction_on_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle accounts_receivable updates
    IF TG_TABLE_NAME = 'accounts_receivable' THEN
        -- If status changed from 'received' to something else, delete the transaction
        IF OLD.status = 'received' AND NEW.status != 'received' THEN
            DELETE FROM public.financial_transactions 
            WHERE reference_type = 'account_receivable' 
            AND reference_id = OLD.id;
            
            -- Update bank account balance (subtract the amount)
            IF OLD.bank_account_id IS NOT NULL THEN
                UPDATE public.bank_accounts 
                SET balance = balance - OLD.amount,
                    updated_at = now()
                WHERE id = OLD.bank_account_id;
            END IF;
        END IF;
        
        -- If status changed to 'received' from something else, create the transaction
        IF OLD.status != 'received' AND NEW.status = 'received' THEN
            INSERT INTO public.financial_transactions (
                saas_client_id, bank_account_id, type, amount, description, 
                category, transaction_date, reference_type, reference_id
            ) VALUES (
                NEW.saas_client_id, NEW.bank_account_id, 'income', NEW.amount, 
                NEW.description, NEW.category, 
                COALESCE(NEW.received_date, CURRENT_DATE), 
                'account_receivable', NEW.id
            );
        END IF;
        
        -- If received_date changed, update the transaction date
        IF OLD.status = 'received' AND NEW.status = 'received' AND OLD.received_date != NEW.received_date THEN
            UPDATE public.financial_transactions 
            SET transaction_date = COALESCE(NEW.received_date, CURRENT_DATE),
                updated_at = now()
            WHERE reference_type = 'account_receivable' 
            AND reference_id = NEW.id;
        END IF;
        
        -- If bank_account_id changed, update the transaction
        IF OLD.status = 'received' AND NEW.status = 'received' AND OLD.bank_account_id != NEW.bank_account_id THEN
            UPDATE public.financial_transactions 
            SET bank_account_id = NEW.bank_account_id,
                updated_at = now()
            WHERE reference_type = 'account_receivable' 
            AND reference_id = NEW.id;
        END IF;
    END IF;
    
    -- Handle accounts_payable updates
    IF TG_TABLE_NAME = 'accounts_payable' THEN
        -- If status changed from 'paid' to something else, delete the transaction
        IF OLD.status = 'paid' AND NEW.status != 'paid' THEN
            DELETE FROM public.financial_transactions 
            WHERE reference_type = 'account_payable' 
            AND reference_id = OLD.id;
        END IF;
        
        -- If status changed to 'paid' from something else, create the transaction
        IF OLD.status != 'paid' AND NEW.status = 'paid' THEN
            INSERT INTO public.financial_transactions (
                saas_client_id, type, amount, description, 
                category, transaction_date, reference_type, reference_id
            ) VALUES (
                NEW.saas_client_id, 'expense', NEW.amount, 
                NEW.description, NEW.category, 
                COALESCE(NEW.paid_date, CURRENT_DATE), 
                'account_payable', NEW.id
            );
        END IF;
        
        -- If paid_date changed, update the transaction date
        IF OLD.status = 'paid' AND NEW.status = 'paid' AND OLD.paid_date != NEW.paid_date THEN
            UPDATE public.financial_transactions 
            SET transaction_date = COALESCE(NEW.paid_date, CURRENT_DATE),
                updated_at = now()
            WHERE reference_type = 'account_payable' 
            AND reference_id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle financial transaction deletions when accounts are deleted
CREATE OR REPLACE FUNCTION public.cleanup_financial_transaction_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete related financial transactions
    DELETE FROM public.financial_transactions 
    WHERE (reference_type = 'account_receivable' AND reference_id = OLD.id)
    OR (reference_type = 'account_payable' AND reference_id = OLD.id);
    
    -- If it was a received account, update bank balance
    IF TG_TABLE_NAME = 'accounts_receivable' AND OLD.status = 'received' AND OLD.bank_account_id IS NOT NULL THEN
        UPDATE public.bank_accounts 
        SET balance = balance - OLD.amount,
            updated_at = now()
        WHERE id = OLD.bank_account_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS sync_financial_transaction_on_update_trigger ON public.accounts_receivable;
DROP TRIGGER IF EXISTS sync_financial_transaction_on_update_trigger ON public.accounts_payable;
DROP TRIGGER IF EXISTS cleanup_financial_transaction_on_delete_trigger ON public.accounts_receivable;
DROP TRIGGER IF EXISTS cleanup_financial_transaction_on_delete_trigger ON public.accounts_payable;

-- Create triggers for UPDATE operations
CREATE TRIGGER sync_financial_transaction_on_update_trigger
    AFTER UPDATE ON public.accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_financial_transaction_on_update();

CREATE TRIGGER sync_financial_transaction_on_update_trigger
    AFTER UPDATE ON public.accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_financial_transaction_on_update();

-- Create triggers for DELETE operations
CREATE TRIGGER cleanup_financial_transaction_on_delete_trigger
    BEFORE DELETE ON public.accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_financial_transaction_on_delete();

CREATE TRIGGER cleanup_financial_transaction_on_delete_trigger
    BEFORE DELETE ON public.accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_financial_transaction_on_delete();

-- Create function to validate financial transaction consistency
CREATE OR REPLACE FUNCTION public.validate_financial_consistency()
RETURNS TABLE(
    table_name text,
    account_id uuid,
    status text,
    has_transaction boolean,
    should_have_transaction boolean,
    is_consistent boolean
) AS $$
BEGIN
    -- Check accounts_receivable consistency
    RETURN QUERY
    SELECT 
        'accounts_receivable'::text,
        ar.id,
        ar.status::text,
        EXISTS(SELECT 1 FROM financial_transactions ft WHERE ft.reference_type = 'account_receivable' AND ft.reference_id = ar.id),
        ar.status = 'received',
        (ar.status = 'received') = EXISTS(SELECT 1 FROM financial_transactions ft WHERE ft.reference_type = 'account_receivable' AND ft.reference_id = ar.id)
    FROM accounts_receivable ar;
    
    -- Check accounts_payable consistency
    RETURN QUERY
    SELECT 
        'accounts_payable'::text,
        ap.id,
        ap.status::text,
        EXISTS(SELECT 1 FROM financial_transactions ft WHERE ft.reference_type = 'account_payable' AND ft.reference_id = ap.id),
        ap.status = 'paid',
        (ap.status = 'paid') = EXISTS(SELECT 1 FROM financial_transactions ft WHERE ft.reference_type = 'account_payable' AND ft.reference_id = ap.id)
    FROM accounts_payable ap;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log successful financial consistency implementation
INSERT INTO public.security_audit_log (
    user_id, action, resource_type, success, metadata
) VALUES (
    auth.uid(),
    'FINANCIAL_CONSISTENCY_IMPLEMENTED',
    'system',
    true,
    jsonb_build_object(
        'timestamp', now(),
        'triggers_created', array[
            'sync_financial_transaction_on_update_trigger',
            'cleanup_financial_transaction_on_delete_trigger'
        ],
        'functions_created', array[
            'sync_financial_transaction_on_update',
            'cleanup_financial_transaction_on_delete',
            'validate_financial_consistency'
        ]
    )
);
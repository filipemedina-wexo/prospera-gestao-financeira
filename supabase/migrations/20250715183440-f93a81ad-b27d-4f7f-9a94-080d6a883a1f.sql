-- Step 2: Ensure Transaction Synchronization (UPDATE and DELETE)
-- Create enhanced triggers for financial transaction synchronization

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS sync_financial_transaction_on_update ON public.accounts_receivable;
DROP TRIGGER IF EXISTS sync_financial_transaction_on_update ON public.accounts_payable;
DROP TRIGGER IF EXISTS cleanup_financial_transaction_on_delete ON public.accounts_receivable;
DROP TRIGGER IF EXISTS cleanup_financial_transaction_on_delete ON public.accounts_payable;

-- Update the sync function to handle all scenarios
CREATE OR REPLACE FUNCTION public.sync_financial_transaction_comprehensive()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle accounts_receivable updates
    IF TG_TABLE_NAME = 'accounts_receivable' THEN
        RAISE NOTICE 'Processing accounts_receivable: % -> %', COALESCE(OLD.status, 'NULL'), NEW.status;
        
        -- If status changed from 'received' to something else, delete the transaction
        IF OLD.status = 'received' AND NEW.status != 'received' THEN
            DELETE FROM public.financial_transactions 
            WHERE reference_type = 'account_receivable' 
            AND reference_id = OLD.id;
            
            RAISE NOTICE 'Deleted transaction for receivable % (status changed from received to %)', OLD.id, NEW.status;
            
            -- Update bank account balance (subtract the amount)
            IF OLD.bank_account_id IS NOT NULL THEN
                UPDATE public.bank_accounts 
                SET balance = balance - OLD.amount,
                    updated_at = now()
                WHERE id = OLD.bank_account_id;
                
                RAISE NOTICE 'Updated bank account % balance by -%', OLD.bank_account_id, OLD.amount;
            END IF;
        END IF;
        
        -- If status changed to 'received' from something else, create the transaction
        IF (OLD.status IS NULL OR OLD.status != 'received') AND NEW.status = 'received' THEN
            INSERT INTO public.financial_transactions (
                saas_client_id, bank_account_id, type, amount, description, 
                category, transaction_date, reference_type, reference_id
            ) VALUES (
                NEW.saas_client_id, NEW.bank_account_id, 'income', NEW.amount, 
                NEW.description, NEW.category, 
                COALESCE(NEW.received_date, CURRENT_DATE), 
                'account_receivable', NEW.id
            );
            
            RAISE NOTICE 'Created transaction for receivable % (status changed to received)', NEW.id;
            
            -- Update bank account balance (add the amount)
            IF NEW.bank_account_id IS NOT NULL THEN
                UPDATE public.bank_accounts 
                SET balance = balance + NEW.amount,
                    updated_at = now()
                WHERE id = NEW.bank_account_id;
                
                RAISE NOTICE 'Updated bank account % balance by +%', NEW.bank_account_id, NEW.amount;
            END IF;
        END IF;
        
        -- If already received and details changed, update the transaction
        IF OLD.status = 'received' AND NEW.status = 'received' THEN
            UPDATE public.financial_transactions 
            SET 
                bank_account_id = NEW.bank_account_id,
                amount = NEW.amount,
                description = NEW.description,
                category = NEW.category,
                transaction_date = COALESCE(NEW.received_date, CURRENT_DATE),
                updated_at = now()
            WHERE reference_type = 'account_receivable' 
            AND reference_id = NEW.id;
            
            -- Update bank account balances if account changed
            IF OLD.bank_account_id != NEW.bank_account_id THEN
                -- Remove from old account
                IF OLD.bank_account_id IS NOT NULL THEN
                    UPDATE public.bank_accounts 
                    SET balance = balance - OLD.amount,
                        updated_at = now()
                    WHERE id = OLD.bank_account_id;
                END IF;
                
                -- Add to new account
                IF NEW.bank_account_id IS NOT NULL THEN
                    UPDATE public.bank_accounts 
                    SET balance = balance + NEW.amount,
                        updated_at = now()
                    WHERE id = NEW.bank_account_id;
                END IF;
            ELSIF OLD.amount != NEW.amount THEN
                -- Update balance if amount changed
                IF NEW.bank_account_id IS NOT NULL THEN
                    UPDATE public.bank_accounts 
                    SET balance = balance - OLD.amount + NEW.amount,
                        updated_at = now()
                    WHERE id = NEW.bank_account_id;
                END IF;
            END IF;
            
            RAISE NOTICE 'Updated transaction for receivable % (details changed)', NEW.id;
        END IF;
    END IF;
    
    -- Handle accounts_payable updates
    IF TG_TABLE_NAME = 'accounts_payable' THEN
        RAISE NOTICE 'Processing accounts_payable: % -> %', COALESCE(OLD.status, 'NULL'), NEW.status;
        
        -- If status changed from 'paid' to something else, delete the transaction
        IF OLD.status = 'paid' AND NEW.status != 'paid' THEN
            DELETE FROM public.financial_transactions 
            WHERE reference_type = 'account_payable' 
            AND reference_id = OLD.id;
            
            RAISE NOTICE 'Deleted transaction for payable % (status changed from paid to %)', OLD.id, NEW.status;
        END IF;
        
        -- If status changed to 'paid' from something else, create the transaction
        IF (OLD.status IS NULL OR OLD.status != 'paid') AND NEW.status = 'paid' THEN
            INSERT INTO public.financial_transactions (
                saas_client_id, type, amount, description, 
                category, transaction_date, reference_type, reference_id
            ) VALUES (
                NEW.saas_client_id, 'expense', NEW.amount, 
                NEW.description, NEW.category, 
                COALESCE(NEW.paid_date, CURRENT_DATE), 
                'account_payable', NEW.id
            );
            
            RAISE NOTICE 'Created transaction for payable % (status changed to paid)', NEW.id;
        END IF;
        
        -- If already paid and details changed, update the transaction
        IF OLD.status = 'paid' AND NEW.status = 'paid' THEN
            UPDATE public.financial_transactions 
            SET 
                amount = NEW.amount,
                description = NEW.description,
                category = NEW.category,
                transaction_date = COALESCE(NEW.paid_date, CURRENT_DATE),
                updated_at = now()
            WHERE reference_type = 'account_payable' 
            AND reference_id = NEW.id;
            
            RAISE NOTICE 'Updated transaction for payable % (details changed)', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create enhanced cleanup function for deletes
CREATE OR REPLACE FUNCTION public.cleanup_financial_transaction_comprehensive()
RETURNS TRIGGER AS $$
BEGIN
    RAISE NOTICE 'Cleaning up transactions for % with id %', TG_TABLE_NAME, OLD.id;
    
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
        
        RAISE NOTICE 'Updated bank account % balance by -% (receivable deleted)', OLD.bank_account_id, OLD.amount;
    END IF;
    
    RAISE NOTICE 'Cleanup completed for % with id %', TG_TABLE_NAME, OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create comprehensive triggers for accounts_receivable
CREATE TRIGGER sync_financial_transaction_on_update_receivable
    AFTER UPDATE ON public.accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_financial_transaction_comprehensive();

CREATE TRIGGER cleanup_financial_transaction_on_delete_receivable
    AFTER DELETE ON public.accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_financial_transaction_comprehensive();

-- Create comprehensive triggers for accounts_payable
CREATE TRIGGER sync_financial_transaction_on_update_payable
    AFTER UPDATE ON public.accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_financial_transaction_comprehensive();

CREATE TRIGGER cleanup_financial_transaction_on_delete_payable
    AFTER DELETE ON public.accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_financial_transaction_comprehensive();

-- Log trigger creation
INSERT INTO public.security_audit_log (
    user_id, action, resource_type, success, metadata
) VALUES (
    auth.uid(),
    'TRIGGER_CREATED',
    'financial_transactions',
    true,
    jsonb_build_object(
        'triggers_created', ARRAY[
            'sync_financial_transaction_on_update_receivable',
            'cleanup_financial_transaction_on_delete_receivable',
            'sync_financial_transaction_on_update_payable',
            'cleanup_financial_transaction_on_delete_payable'
        ],
        'created_at', now()
    )
);